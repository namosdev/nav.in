/**
 * WaterRipple.js
 *
 * A self-contained WebGL water ripple cursor effect.
 * When the user moves their mouse, soft ripples appear in the background
 * — like light refracting through shallow water. The effect warps a colour
 * gradient (not a photo). The canvas sits behind all page content.
 *
 * Desktop only. On screens narrower than 768px the component renders
 * children with no canvas at all — no WebGL, no overhead.
 *
 * Props:
 *   children  — page content, rendered above the canvas
 *   className — optional extra class for the outer wrapper
 */

import { useEffect, useRef } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
// These values are hardcoded and not exposed as props to keep the component
// simple. Change them here if you ever want to tweak the feel of the effect.

const BRUSH_COUNT = 5;           // How many ripple stamps exist in the pool
const INTENSITY = 0.05;          // How strongly the ripple distorts the image
const DECAY = 0.96;              // How fast each ripple fades (0.96 = fades gently)
const MOVEMENT_THRESHOLD = 4;    // Minimum px of mouse movement before a new ripple spawns
const MOBILE_BREAKPOINT = 768;   // Screens below this width skip WebGL entirely

// ─── Shaders ─────────────────────────────────────────────────────────────────
// Shaders are tiny programs that run on the GPU. There are two pairs here:
// one pair for the final colour display, and one pair for painting the
// invisible "ripple map" that drives the distortion.

// Shared vertex shader — positions a full-screen triangle so the fragment
// shader can paint every pixel. Both display and brush use a version of this.
const VERTEX_SHADER = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Display fragment shader — reads the displacement map and shifts UV
// coordinates so the colour texture appears to ripple.
const DISPLAY_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture;      /* the colour gradient background */
  uniform sampler2D uDisplacement; /* the invisible ripple map */
  uniform float     uIntensity;    /* how much to shift each pixel */
  varying vec2 vUv;
  const float PI = 3.1415926535897932384626433832795;
  void main() {
    /* Read the red channel from the ripple map — it encodes ripple direction */
    vec4 displacement = texture2D(uDisplacement, vUv);
    /* Convert 0-1 value to an angle in radians */
    float theta = displacement.r * 2.0 * PI;
    /* Derive a 2-D shift direction from that angle */
    vec2 dir = vec2(sin(theta), cos(theta));
    /* Offset the UV, then clamp so we never sample outside the texture */
    vec2 finalUv = vUv + dir * displacement.r * uIntensity;
    finalUv = clamp(finalUv, 0.0, 1.0);
    gl_FragColor = texture2D(uTexture, finalUv);
  }
`;

// Brush vertex shader — positions each ripple stamp in the scene.
// It respects the camera matrices so stamps can be moved in clip space.
const BRUSH_VERT = /* glsl */ `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Brush fragment shader — paints a soft white circle onto the ripple map.
// White areas create distortion; black areas have none.
const BRUSH_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uBrush;   /* the soft white circle texture */
  uniform float     uOpacity; /* fades to 0 as the ripple ages */
  varying vec2 vUv;
  void main() {
    vec4 tex = texture2D(uBrush, vUv);
    float val = tex.r * uOpacity;
    gl_FragColor = vec4(val, val, val, val);
  }
`;

// ─── Texture Generators ───────────────────────────────────────────────────────
// These run in the browser at mount time, drawing onto hidden <canvas> elements
// to produce textures. No external image files are needed.

/**
 * buildGradientCanvas()
 * Creates a 256×256 canvas with the site's sage/amber colour palette,
 * radiating outward from a bright centre to near-black at the edge.
 * This becomes the colour layer that the ripple effect warps.
 */
function buildGradientCanvas() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Primary sage gradient — centre bright, edges dark
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0.00, '#2d6a4f');   // sage at centre
  grad.addColorStop(0.25, '#52b788');   // lighter sage
  grad.addColorStop(0.80, '#1a3d2e');   // deep sage-dark
  grad.addColorStop(1.00, '#080e0b');   // near-black at edge
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Amber accent layer — very faint (8% opacity), only at the midpoint ring.
  // This adds warmth without overpowering the sage palette.
  const amberGrad = ctx.createRadialGradient(cx, cy, size * 0.35, cx, cy, size * 0.55);
  amberGrad.addColorStop(0.0, 'rgba(180,83,9,0)');      // transparent inside ring
  amberGrad.addColorStop(0.5, 'rgba(180,83,9,0.08)');   // subtle amber at 55% radius
  amberGrad.addColorStop(1.0, 'rgba(180,83,9,0)');      // transparent outside ring
  ctx.fillStyle = amberGrad;
  ctx.fillRect(0, 0, size, size);

  return c;
}

/**
 * buildBrushCanvas()
 * Creates a 256×256 canvas with a soft white circle on a black background.
 * This is the "stamp" shape for each ripple. White = distortion, black = none.
 * The Gaussian-style falloff gives the ripple a smooth, organic edge.
 */
function buildBrushCanvas() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  // Black background — areas of black contribute zero distortion
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  // Soft white circle — solid white centre fading smoothly to black at ~100px radius
  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
  grad.addColorStop(0.0,  'rgba(255,255,255,1)');   // fully white at centre
  grad.addColorStop(0.4,  'rgba(255,255,255,0.8)'); // still quite white
  grad.addColorStop(0.75, 'rgba(255,255,255,0.2)'); // fading
  grad.addColorStop(1.0,  'rgba(255,255,255,0)');   // fully transparent at edge
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return c;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WaterRipple({ children, className = '' }) {
  const canvasRef = useRef(null);    // reference to the <canvas> element
  const wrapperRef = useRef(null);   // reference to the outer wrapper div

  useEffect(() => {
    // ── Mobile guard ──────────────────────────────────────────────────────────
    // If the screen is narrower than 768px we skip all WebGL work entirely.
    // No canvas is initialised, no GPU memory is allocated. Children render
    // as normal — just without the ripple effect behind them.
    if (window.innerWidth < MOBILE_BREAKPOINT) return;

    // The canvas element might not be in the DOM yet if the component re-mounts.
    if (!canvasRef.current) return;

    // ── OGL Imports ───────────────────────────────────────────────────────────
    // We import OGL dynamically inside the effect so it is never loaded on
    // mobile (server-side rendering would also never reach this branch).
    const {
      Renderer,
      Camera,
      Transform,
      Mesh,
      Triangle,
      Program,
      Texture,
      RenderTarget,
    } = require('ogl');

    // ── 1. Renderer ───────────────────────────────────────────────────────────
    // The Renderer wraps the WebGL context and handles drawing calls.
    // alpha: true lets the page background show through any transparent areas.
    // dpr is passed in the constructor — OGL has no setPixelRatio() method.
    const canvas = canvasRef.current;
    const parent = canvas.parentElement; // the .ripple-carrier div

    // Respect high-DPI screens (retina), capped at 2× to avoid GPU overload
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new Renderer({ canvas, alpha: true, dpr });
    const gl = renderer.gl;

    // Size the renderer to fill its container
    const initialWidth  = parent.clientWidth;
    const initialHeight = parent.clientHeight;
    renderer.setSize(initialWidth, initialHeight);

    // ── 2. Cameras ────────────────────────────────────────────────────────────
    // Orthographic cameras map clip-space coordinates (-1 to 1) directly to
    // the screen — no perspective foreshortening. We use two:
    //   brushCamera  — used when rendering ripple stamps into the FBO
    //   displayCamera — used when rendering the final visible scene
    const brushCamera = new Camera(gl, { left: -1, right: 1, top: 1, bottom: -1 });
    brushCamera.position.z = 1;

    const displayCamera = new Camera(gl, { left: -1, right: 1, top: 1, bottom: -1 });
    displayCamera.position.z = 1;

    // ── 3. Background Texture ─────────────────────────────────────────────────
    // This is the colour layer that the ripple effect warps. Built from the
    // programmatic sage/amber gradient canvas (no external image files).
    const gradientCanvas  = buildGradientCanvas();
    const backgroundTexture = new Texture(gl, {
      image: gradientCanvas,
      generateMipmaps: false, // mipmaps not needed for a full-screen effect
    });

    // ── 4. Framebuffer (Displacement Buffer / FBO) ────────────────────────────
    // A Framebuffer Object (FBO) is an off-screen render target — the GPU
    // draws into it instead of the screen. We render the ripple stamps here
    // to build an invisible "ripple map". The display shader then reads from
    // this map to know where and how much to distort the colour texture.
    // Using UNSIGNED_BYTE keeps memory usage low for this effect.
    let fbo = new RenderTarget(gl, {
      width:  initialWidth,
      height: initialHeight,
      type:   gl.UNSIGNED_BYTE,
    });

    // ── 5. Brush Texture ──────────────────────────────────────────────────────
    // The soft white circle that gets stamped onto the FBO at each mouse
    // position. White pixels create distortion; the gradient falloff makes
    // each ripple feel organic.
    const brushCanvas  = buildBrushCanvas();
    const brushTexture = new Texture(gl, {
      image: brushCanvas,
      generateMipmaps: false,
    });

    // ── 6. Scenes ─────────────────────────────────────────────────────────────
    // OGL uses Transform nodes as scene containers. We keep two separate
    // scenes so the brush stamps and the display quad never mix.
    const brushScene   = new Transform(); // holds the 5 ripple stamp meshes
    const displayScene = new Transform(); // holds the single full-screen quad

    // ── 7. Display Mesh ───────────────────────────────────────────────────────
    // A Triangle is OGL's built-in full-screen geometry — one large triangle
    // that covers the entire viewport. The fragment shader does all the work.
    const displayGeo = new Triangle(gl);
    const displayProgram = new Program(gl, {
      vertex:   VERTEX_SHADER,
      fragment: DISPLAY_FRAG,
      uniforms: {
        uTexture:     { value: backgroundTexture },
        uDisplacement:{ value: fbo.texture },       // reads from the FBO each frame
        uIntensity:   { value: INTENSITY },
      },
    });
    const displayMesh = new Mesh(gl, { geometry: displayGeo, program: displayProgram });
    displayMesh.setParent(displayScene);

    // ── 8. Brush Pool ─────────────────────────────────────────────────────────
    // Instead of creating a new mesh for every mouse movement, we keep a
    // small fixed pool of 5 meshes and reuse them round-robin. This avoids
    // allocating GPU memory on every pointer event.
    //
    // Each brush is a tiny flat quad (0.2 × 0.2 in clip space). Its position
    // moves to wherever the mouse is; its opacity decays each frame.

    // Helper: build a flat quad geometry from scratch using OGL's low-level API.
    // The quad spans from -0.1 to 0.1 in both x and y (size 0.2 in clip space).
    function makePlaneGeometry() {
      const { Geometry } = require('ogl');
      return new Geometry(gl, {
        position: {
          size: 3,
          data: new Float32Array([
            -0.1, -0.1, 0,   // bottom-left
             0.1, -0.1, 0,   // bottom-right
            -0.1,  0.1, 0,   // top-left
             0.1,  0.1, 0,   // top-right
          ]),
        },
        uv: {
          size: 2,
          data: new Float32Array([
            0, 0,   // bottom-left UV
            1, 0,   // bottom-right UV
            0, 1,   // top-left UV
            1, 1,   // top-right UV
          ]),
        },
        index: {
          data: new Uint16Array([0, 1, 2, 1, 3, 2]), // two triangles making a quad
        },
      });
    }

    // Build the pool: each entry holds the mesh plus its mutable scale state
    const brushPool = Array.from({ length: BRUSH_COUNT }, () => {
      const program = new Program(gl, {
        vertex:   BRUSH_VERT,
        fragment: BRUSH_FRAG,
        uniforms: {
          uBrush:   { value: brushTexture },
          uOpacity: { value: 0 },          // starts invisible
        },
        transparent: true,                 // allow additive blending in FBO
        depthTest:   false,                // no depth needed for 2-D stamps
        depthWrite:  false,
      });
      const mesh = new Mesh(gl, { geometry: makePlaneGeometry(), program });
      mesh.setParent(brushScene);
      mesh.visible = false; // hidden until a ripple is spawned

      return {
        mesh,
        scaleX: 1.5, // tracks the eased scale independently per axis
        scaleY: 1.5,
        get opacityUniform() { return program.uniforms.uOpacity; },
      };
    });

    let nextBrushIndex = 0; // round-robin cursor into the pool

    // ── 9. Pointer Tracking ───────────────────────────────────────────────────
    // We listen on document so the effect responds to mouse movement anywhere
    // on the page — including areas covered by nav, footer, or page content
    // that sit in front of this canvas in the stacking order.
    // Coordinates are converted to clip-space using the wrapper's bounding rect,
    // which equals the full viewport when ripple-full-page is applied.

    let lastSpawnX = -9999; // previous spawn position (px) — used to throttle
    let lastSpawnY = -9999;

    function spawnBrush(clipX, clipY) {
      // Grab the next entry from the pool, wrapping around at BRUSH_COUNT
      const entry = brushPool[nextBrushIndex % BRUSH_COUNT];
      nextBrushIndex++;

      // Move the mesh to the mouse position (clip space: -1 to 1)
      entry.mesh.position.x = clipX;
      entry.mesh.position.y = clipY;
      entry.mesh.visible    = true;

      // Reset opacity and scale so the ripple "punches in"
      entry.opacityUniform.value = 1;
      entry.scaleX = 1.5;
      entry.scaleY = 1.5;
      entry.mesh.scale.set(1.5, 1.5, 1);
    }

    function onPointerMove(e) {
      // Find the bounding box of the wrapper div to convert to local coords
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Distance from last spawn — only spawn if the mouse moved enough
      const dx = e.clientX - lastSpawnX;
      const dy = e.clientY - lastSpawnY;
      if (Math.sqrt(dx * dx + dy * dy) < MOVEMENT_THRESHOLD) return;

      lastSpawnX = e.clientX;
      lastSpawnY = e.clientY;

      // Convert screen pixel position to clip-space (-1 to +1)
      const clipX =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
      const clipY = -((e.clientY - rect.top)   / rect.height) * 2 + 1; // Y flipped

      spawnBrush(clipX, clipY);
    }

    document.addEventListener('pointermove', onPointerMove);

    // ── 10. Resize Handling ───────────────────────────────────────────────────
    // When the container changes size, the renderer and FBO must update so
    // the effect doesn't appear stretched or cropped.
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;

        renderer.setSize(width, height);

        // Replace the FBO — WebGL FBOs cannot be resized in-place
        fbo = new RenderTarget(gl, {
          width,
          height,
          type: gl.UNSIGNED_BYTE,
        });

        // Point the display shader at the new FBO texture
        displayProgram.uniforms.uDisplacement.value = fbo.texture;
      }
    });
    resizeObserver.observe(parent);

    // ── 11. Animation Loop ────────────────────────────────────────────────────
    // This runs 60 times per second (or at the monitor's refresh rate).
    // Each frame: update all active brushes, render stamps into FBO, then
    // render the distorted colour layer to the screen.

    let rafId; // stores the animation frame handle so we can cancel on cleanup

    function animate() {
      rafId = requestAnimationFrame(animate);

      // --- Update each brush in the pool ---
      for (const entry of brushPool) {
        if (!entry.mesh.visible) continue; // skip inactive stamps

        // Slowly rotate the stamp for a more organic, swirling look
        entry.mesh.rotation.z += 0.02;

        // Decay opacity toward zero — once nearly invisible, hide the mesh
        entry.opacityUniform.value *= DECAY;
        if (entry.opacityUniform.value < 0.002) {
          entry.mesh.visible = false;
          continue;
        }

        // Ease the scale upward smoothly (exponential approach toward ~6×)
        // This makes each ripple expand outward as it fades
        entry.scaleX = 0.982 * entry.scaleX + 0.108;
        entry.scaleY = 0.982 * entry.scaleY + 0.108;
        entry.mesh.scale.set(entry.scaleX, entry.scaleY, 1);
      }

      // --- Pass 1: render brush stamps into the off-screen FBO ---
      // clear: false means stamps accumulate — old ripples persist until they
      // fade on their own, rather than being wiped each frame.
      renderer.render({
        scene:  brushScene,
        camera: brushCamera,
        target: fbo,
        clear:  false,
      });

      // --- Pass 2: render the distorted colour layer to the screen ---
      // The display shader reads from fbo.texture (updated in Pass 1) and
      // shifts the colour gradient to create the ripple illusion.
      renderer.render({
        scene:  displayScene,
        camera: displayCamera,
      });
    }

    animate(); // kick off the loop

    // ── 12. Cleanup ───────────────────────────────────────────────────────────
    // When the component unmounts (e.g. navigating to another page), we free
    // all GPU and browser resources to prevent memory leaks.
    return () => {
      cancelAnimationFrame(rafId);            // stop the animation loop
      resizeObserver.disconnect();            // stop watching size changes
      document.removeEventListener('pointermove', onPointerMove);

      // Release the WebGL framebuffer. gl.deleteFramebuffer is the standard
      // WebGL API for freeing GPU-side buffer memory.
      if (fbo && fbo.buffer) {
        try { gl.deleteFramebuffer(fbo.buffer); } catch (_) { /* ignore */ }
      }

      // Setting canvas size to 0 signals the browser to free GPU memory
      canvas.width  = 0;
      canvas.height = 0;
    };
  }, []); // empty deps — runs once on mount, cleans up on unmount

  // ── Render ────────────────────────────────────────────────────────────────
  // The structure keeps the canvas behind all page content:
  //   ripple-wrapper  — positioned container (fills its parent)
  //   ripple-carrier  — absolute layer at z-index 0, holds the canvas
  //   ripple-content  — absolute layer at z-index 1, holds children

  return (
    <>
      {/* Scoped inline styles — no external CSS file needed */}
      <style>{`
        .ripple-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .ripple-carrier {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none; /* mouse events pass through to the content layer */
        }
        .ripple-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }
        .ripple-content {
          position: relative;
          z-index: 1;
          width: 100%;
          height: 100%;
        }
      `}</style>

      <div ref={wrapperRef} className={`ripple-wrapper${className ? ' ' + className : ''}`}>
        {/* Canvas layer — WebGL draws here; hidden on mobile via the useEffect guard */}
        <div className="ripple-carrier">
          <canvas ref={canvasRef} className="ripple-canvas" />
        </div>

        {/* Content layer — page content sits on top of the ripple canvas */}
        <div className="ripple-content">
          {children}
        </div>
      </div>
    </>
  );
}
