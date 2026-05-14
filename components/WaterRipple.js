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
// ogl is an ESM-only package — must use ES6 import, not require().
// This file is always loaded via dynamic({ ssr: false }) so the server
// bundle never processes these imports; only the client chunk sees them.
import {
  Renderer, Camera, Transform, Mesh, Triangle,
  Program, Texture, RenderTarget, Geometry,
} from 'ogl';

// ─── Constants ────────────────────────────────────────────────────────────────
// These values are hardcoded and not exposed as props to keep the component
// simple. Change them here if you ever want to tweak the feel of the effect.

const BRUSH_COUNT = 7;           // Ring stamps active at once — more = richer ripple trail
const DECAY = 0.955;             // How fast each ring fades (higher = longer-lasting)
const MOVEMENT_THRESHOLD = 3;    // Minimum px of mouse movement before a new ring spawns
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

// Display fragment shader — turns the displacement map into visible water rings.
//
// APPROACH: instead of drawing a colour blob, we compute the spatial gradient
// (rate-of-change) of the displacement map. Where displacement changes steeply
// — i.e. at the inner and outer edges of each ring stamp — we light up with a
// soft sage shimmer. This creates thin, expanding luminous rings that look like
// light refracting on water, not a dark cloud following the cursor.
//
// The canvas stays FULLY TRANSPARENT where no ring edge is present, so the
// page background is never tinted or obscured.
const DISPLAY_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uDisplacement; /* the displacement map from brush stamps */
  uniform vec2      uResolution;   /* FBO dimensions — needed for pixel-step size */
  varying vec2 vUv;

  void main() {
    /* One-pixel step in UV space, based on the FBO resolution */
    vec2 px = 1.0 / uResolution;

    /* Sample displacement at this pixel and its four neighbours.
       Using a 2-pixel step gives softer, more organic-looking ring edges. */
    float centre = texture2D(uDisplacement, vUv).r;
    float dx = texture2D(uDisplacement, vUv + vec2(px.x * 2.0, 0.0)).r
             - texture2D(uDisplacement, vUv - vec2(px.x * 2.0, 0.0)).r;
    float dy = texture2D(uDisplacement, vUv + vec2(0.0, px.y * 2.0)).r
             - texture2D(uDisplacement, vUv - vec2(0.0, px.y * 2.0)).r;

    /* Edge strength = magnitude of the displacement gradient.
       High where the ring boundary is — exactly the ring edges we want to see. */
    float edge = clamp(sqrt(dx * dx + dy * dy) * 6.0, 0.0, 1.0);

    /* Faint base fill inside the ring body so it's not just hairlines */
    float fill = centre * 0.28;

    float strength = clamp(edge + fill, 0.0, 1.0);

    /* Fully transparent outside any active ring — page shows through normally */
    if (strength < 0.01) {
      gl_FragColor = vec4(0.0);
      return;
    }

    /* Ring edges are near-white (like a light caustic); ring body is sage-light.
       mix() blends between the two based on how much is edge vs fill. */
    vec3 ringEdge = vec3(0.88, 0.97, 0.92);   /* near-white with sage tint */
    vec3 ringBody = vec3(0.32, 0.72, 0.53);   /* #52b788 sage-light */
    float edgeFrac = edge / (strength + 0.001);
    vec3  colour   = mix(ringBody, ringEdge, edgeFrac);

    gl_FragColor = vec4(colour, strength * 0.68);
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

// Brush fragment shader — paints the ring-shaped stamp onto the displacement map.
// White ring areas get picked up by the display shader's edge detection; the
// transparent centre means there is no blob at the cursor's current position.
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
 * buildBrushCanvas()
 * Creates a 256×256 ring-shaped brush texture.
 *
 * The ring shape (transparent centre → bright band → transparent outside) means
 * each stamp paints an annulus into the displacement map. As the stamp scales
 * up over its lifetime, the ring expands outward — exactly like a water ripple.
 *
 * The edge-detection display shader then finds the ring's inner and outer
 * boundaries and lights them up as thin luminous lines. Result: concentric
 * expanding rings, not a blob.
 */
function buildBrushCanvas() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  // Transparent background — areas outside the ring contribute zero displacement
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  // Ring: transparent at centre, peaks at ~50% radius, fades back to transparent.
  // The slight fill inside (stop at 0.35) gives the ring body just enough
  // displacement for the base-fill pass in the display shader.
  const grad = ctx.createRadialGradient(cx, cy, size * 0.10, cx, cy, size * 0.50);
  grad.addColorStop(0.00, 'rgba(255,255,255,0)');    // transparent centre
  grad.addColorStop(0.35, 'rgba(255,255,255,0.12)'); // faint fill inside ring
  grad.addColorStop(0.60, 'rgba(255,255,255,1)');    // bright at ring peak
  grad.addColorStop(0.80, 'rgba(255,255,255,0.35)'); // soft outer shoulder
  grad.addColorStop(1.00, 'rgba(255,255,255,0)');    // transparent outside
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

    // ── 1. Renderer ───────────────────────────────────────────────────────────
    const canvas = canvasRef.current;
    const parent = canvas.parentElement; // the .ripple-carrier div

    // Wrap everything in try/catch — WebGL can fail silently on some
    // browsers/GPUs. Any error here gets logged to the console so it's
    // easy to spot in DevTools without breaking the rest of the page.
    let renderer, gl;
    try {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // premultipliedAlpha: false so the browser composites alpha correctly
      // when the display shader outputs non-premultiplied rgba values.
      renderer = new Renderer({ canvas, alpha: true, premultipliedAlpha: false, dpr });
      gl = renderer.gl;
    } catch (err) {
      console.error('[WaterRipple] WebGL context creation failed:', err);
      return;
    }

    // Use parent dimensions with a fallback to window size in case the
    // fixed/absolute element hasn't been laid out yet at mount time.
    const initialWidth  = parent.clientWidth  || window.innerWidth;
    const initialHeight = parent.clientHeight || window.innerHeight;
    renderer.setSize(initialWidth, initialHeight);
    console.log('[WaterRipple] canvas size:', initialWidth, 'x', initialHeight);

    // ── 2. Cameras ────────────────────────────────────────────────────────────
    // Orthographic cameras map clip-space coordinates (-1 to 1) directly to
    // the screen — no perspective foreshortening. We use two:
    //   brushCamera  — used when rendering ripple stamps into the FBO
    //   displayCamera — used when rendering the final visible scene
    const brushCamera = new Camera(gl, { left: -1, right: 1, top: 1, bottom: -1 });
    brushCamera.position.z = 1;

    const displayCamera = new Camera(gl, { left: -1, right: 1, top: 1, bottom: -1 });
    displayCamera.position.z = 1;

    // ── 3. Framebuffer (Displacement Buffer / FBO) ────────────────────────────
    // An off-screen render target where ring-shaped brush stamps are painted
    // each frame. The display shader reads from this to find ring boundaries
    // via edge detection and draws thin luminous rings at those locations.
    let fbo = new RenderTarget(gl, {
      width:  initialWidth,
      height: initialHeight,
      type:   gl.UNSIGNED_BYTE,
    });

    // ── 4. Brush Texture ──────────────────────────────────────────────────────
    // Ring-shaped stamp: transparent centre, bright annulus, transparent outside.
    // Each stamp expands as it ages, so the ring moves outward like a water ripple.
    const brushCanvas  = buildBrushCanvas();
    const brushTexture = new Texture(gl, {
      image: brushCanvas,
      generateMipmaps: false,
    });

    // ── 5. Scenes ─────────────────────────────────────────────────────────────
    const brushScene   = new Transform(); // holds the ring stamp meshes
    const displayScene = new Transform(); // holds the single full-screen quad

    // ── 6. Display Mesh ───────────────────────────────────────────────────────
    // Full-screen triangle; the display shader reads the FBO and highlights
    // ring edges with a light sage shimmer. No background texture needed.
    const displayGeo = new Triangle(gl);
    const displayProgram = new Program(gl, {
      vertex:   VERTEX_SHADER,
      fragment: DISPLAY_FRAG,
      uniforms: {
        uDisplacement: { value: fbo.texture },
        // uResolution tells the edge-detection shader how big one pixel is
        uResolution:   { value: [initialWidth, initialHeight] },
      },
      transparent: true,
      depthTest:   false,
      depthWrite:  false,
    });
    const displayMesh = new Mesh(gl, { geometry: displayGeo, program: displayProgram });
    displayMesh.setParent(displayScene);

    // ── 7. Brush Pool ─────────────────────────────────────────────────────────
    // A fixed pool of ring-stamp meshes, reused round-robin so no GPU memory
    // is allocated on every pointer event.
    //
    // Each stamp is a flat quad (0.2 × 0.2 clip space). Position jumps to the
    // cursor; scale grows each frame so the ring expands; opacity decays to 0.

    // Helper: build a flat quad geometry from scratch using OGL's low-level API.
    // The quad spans from -0.1 to 0.1 in both x and y (size 0.2 in clip space).
    function makePlaneGeometry() {
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

        // Point the display shader at the new FBO texture and updated resolution
        displayProgram.uniforms.uDisplacement.value = fbo.texture;
        displayProgram.uniforms.uResolution.value   = [width, height];
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

      // --- Pass 1: clear the FBO and re-render all active brush stamps ---
      // clear: true wipes the FBO each frame, then re-draws every visible stamp
      // at its current (decaying) opacity. This is how the fade-out actually
      // works — each frame renders a dimmer version until stamps vanish.
      // (clear: false would accumulate old values and never let ripples fade.)
      renderer.render({
        scene:  brushScene,
        camera: brushCamera,
        target: fbo,
        clear:  true,
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
        /*
         * IMPORTANT: .ripple-wrapper intentionally has NO position declaration.
         * When used with .ripple-full-page (see globals.css), the fixed positioning
         * on that class must win. A scoped "position: relative" here would override
         * "position: fixed" from globals.css because this <style> tag is injected
         * after the linked stylesheet, making the cascade order flip.
         */
        .ripple-wrapper {
          width: 100%;
          height: 100%;
        }
        .ripple-carrier {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none; /* mouse events pass through to the content layer */
        }
        .ripple-canvas {
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
