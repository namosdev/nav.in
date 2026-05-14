/**
 * WaterRipple.js
 *
 * A self-contained WebGL water-ripple cursor effect.
 *
 * How it works:
 *   1. A wave-equation simulation runs on the CPU each frame. When the mouse
 *      moves, we disturb a small patch of a 256×256 height grid — like dropping
 *      a pebble. The discrete wave equation then propagates that disturbance
 *      outward as concentric rings, exactly like real water physics.
 *
 *   2. The height grid is uploaded to the GPU as a texture each frame.
 *
 *   3. A fragment shader computes the surface normal at each pixel from the
 *      height gradient, then calculates how a virtual light source reflects off
 *      that surface. The output is bright caustic sparkles where wave crests
 *      would catch the light — the characteristic shimmer of sunlight on water.
 *
 *   4. The canvas is FULLY TRANSPARENT everywhere except those caustic
 *      highlights. The page background, colours, and text are never obscured.
 *      The effect looks like glass water sitting over the page.
 *
 * Desktop only. On screens narrower than 768 px the component renders nothing —
 * no WebGL, no overhead.
 *
 * Props:
 *   className — optional extra class for the outer wrapper (use "ripple-full-page")
 */

import { useEffect, useRef } from 'react';
// ogl is ESM-only — must use ES6 import, not require().
// This file is always loaded via dynamic({ ssr: false }) so the server
// bundle never processes these imports; only the client chunk sees them.
import { Renderer, Camera, Transform, Mesh, Triangle, Program, Texture } from 'ogl';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIM_W   = 256;   // wave grid width (cells) — higher = sharper rings, more CPU
const SIM_H   = 256;   // wave grid height (cells)
const DAMPING = 0.986; // energy loss per frame — 1.0 = lossless, ~0.98 = 2–3 s lifetime
const SPAWN_R = 5;     // radius (cells) of the disturbance when the cursor moves
const MOVE_THRESHOLD = 5; // minimum cursor movement in px before spawning a new ripple
const MOBILE_BREAKPOINT = 768;

// ─── Shaders ─────────────────────────────────────────────────────────────────

// Full-screen vertex shader — OGL's Triangle geometry already provides
// clip-space positions, so we pass them through unchanged.
const VERT = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv         = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Display fragment shader — creates the glass-water look.
//
// For each pixel it:
//   1. Reads the wave height at this pixel and its 4 neighbours
//   2. Computes the surface normal from the height gradient
//      (steep slope → normal tilted away from vertical)
//   3. Reflects a virtual light off that normal (Blinn-Phong specular)
//   4. Outputs the specular highlight on a TRANSPARENT background
//
// The result: fully invisible when water is flat; bright caustic sparkles
// where wave crests catch the light. No colour blob, no dark overlay.
const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uHeight;  /* wave height map — R channel, 0=trough, 0.5=flat, 1=crest */
  uniform vec2      uSimSize; /* (SIM_W, SIM_H) — used to step one cell in UV space */

  varying vec2 vUv;

  void main() {
    /* UV step = one simulation cell */
    vec2 px = 1.0 / uSimSize;

    /* Sample height at this pixel and its neighbours.
       Decode from texture [0,1] → wave height [-1, +1]. */
    float hL = texture2D(uHeight, vUv - vec2(px.x, 0.0)).r * 2.0 - 1.0;
    float hR = texture2D(uHeight, vUv + vec2(px.x, 0.0)).r * 2.0 - 1.0;
    float hD = texture2D(uHeight, vUv - vec2(0.0, px.y)).r * 2.0 - 1.0;
    float hU = texture2D(uHeight, vUv + vec2(0.0, px.y)).r * 2.0 - 1.0;
    float hC = texture2D(uHeight, vUv).r * 2.0 - 1.0;

    /* Surface normal via central-difference gradient.
       The Z component (0.10) controls how pronounced the highlights are:
       smaller = more intense caustics; larger = flatter, calmer look. */
    vec3 normal = normalize(vec3((hL - hR) * 0.5, (hD - hU) * 0.5, 0.10));

    /* Virtual light — angled slightly upper-left, mostly coming from above */
    vec3 lightDir = normalize(vec3(-0.15, 0.30, 0.94));
    vec3 viewDir  = vec3(0.0, 0.0, 1.0);
    vec3 halfVec  = normalize(lightDir + viewDir);

    /* Blinn-Phong specular — tight bright spots at wave crests */
    float spec = pow(max(dot(normal, halfVec), 0.0), 56.0);

    /* Soft diffuse glow across the wider wave body */
    float diff = max(dot(normal, lightDir), 0.0) * 0.15;

    /* Height contribution — very faint glow at wave crests even without spec */
    float height = abs(hC) * 0.05;

    /* Combine — specular dominates so the effect stays mostly transparent */
    float caustic = clamp(spec * 0.92 + diff + height, 0.0, 1.0);

    /* Anything below threshold stays fully transparent — no tint on the page */
    if (caustic < 0.015) {
      gl_FragColor = vec4(0.0);
      return;
    }

    /* Colour: specular peaks are near-white (caustic light flash);
       softer glow is sage-light to match the site palette without
       adding darkness anywhere. */
    vec3 causticWhite = vec3(0.92, 0.99, 0.96);  /* near-white, slight sage tint */
    vec3 sageLight    = vec3(0.32, 0.72, 0.53);  /* #52b788 */
    float specFrac    = spec / (caustic + 0.001); /* 0=glow only, 1=specular peak */
    vec3  colour      = mix(sageLight, causticWhite, specFrac);

    gl_FragColor = vec4(colour, caustic * 0.80);
  }
`;

// ─── Wave Simulation ──────────────────────────────────────────────────────────
//
// The discrete wave equation:
//   next[x,y] = (left + right + up + down) / 2  −  prev[x,y]
//
// Multiplied by DAMPING to slowly bleed energy so rings fade out.
// Two float buffers alternate: one holds the current frame, the other the
// previous frame. After each step we swap which is which.
//
// This is the same algorithm used in countless water ripple demos — it's
// fast, stable, and produces realistic expanding ring propagation.

function makeSimulation() {
  const n      = SIM_W * SIM_H;
  const bufA   = new Float32Array(n);  // "current" frame heights
  const bufB   = new Float32Array(n);  // "previous" frame heights
  let   curr   = bufA;                 // pointer to the current buffer
  let   prev   = bufB;                 // pointer to the previous buffer

  // Advance the simulation by one time step
  function step() {
    // We write new values into `prev`, reading neighbours from `curr`.
    // After the loop, swap so the newly-written buffer becomes "current".
    const c = curr; // read source
    const p = prev; // write destination (reusing old-prev memory)

    for (let y = 1; y < SIM_H - 1; y++) {
      for (let x = 1; x < SIM_W - 1; x++) {
        const i = y * SIM_W + x;
        // Wave equation — p[i] holds old-prev value, c[i±…] holds current
        p[i] = ((c[i - 1] + c[i + 1] + c[i - SIM_W] + c[i + SIM_W]) / 2 - p[i]) * DAMPING;
      }
    }

    // Swap: the buffer we just wrote into is now the new "current"
    prev = curr;
    curr = p;
  }

  // Disturb the water surface at a normalised position (0–1, 0–1).
  // normX=0 = left edge, normX=1 = right edge.
  // normY=0 = top of viewport, normY=1 = bottom (browser coordinates).
  function spawn(normX, normY) {
    // Map to simulation grid — flip Y because the texture bottom = UV y=0
    const cx = Math.round(normX * (SIM_W - 1));
    const cy = Math.round((1 - normY) * (SIM_H - 1));

    for (let dy = -SPAWN_R; dy <= SPAWN_R; dy++) {
      for (let dx = -SPAWN_R; dx <= SPAWN_R; dx++) {
        if (dx * dx + dy * dy > SPAWN_R * SPAWN_R) continue; // stay within circle
        const ix = cx + dx;
        const iy = cy + dy;
        if (ix < 0 || ix >= SIM_W || iy < 0 || iy >= SIM_H) continue;
        curr[iy * SIM_W + ix] = 0.75; // disturb this cell
      }
    }
  }

  // Encode the current float height buffer into RGBA bytes for GPU upload.
  // Height −1→+1 maps to R channel 0→255; G/B/A are unused padding.
  const rgba = new Uint8Array(n * 4);
  function encode() {
    for (let i = 0; i < n; i++) {
      const v = Math.max(0, Math.min(255, Math.round((curr[i] * 0.5 + 0.5) * 255)));
      rgba[i * 4]     = v;   // R: height value
      rgba[i * 4 + 1] = 0;   // G: unused
      rgba[i * 4 + 2] = 0;   // B: unused
      rgba[i * 4 + 3] = 255; // A: fully opaque (texture alpha — not canvas alpha)
    }
    return rgba;
  }

  return { step, spawn, encode };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WaterRipple({ className = '' }) {
  const canvasRef  = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Skip WebGL entirely on mobile — no visual loss, no CPU overhead
    if (window.innerWidth < MOBILE_BREAKPOINT) return;
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement; // .ripple-carrier div

    // ── 1. WebGL Renderer ─────────────────────────────────────────────────────
    // premultipliedAlpha: false ensures correct browser compositing when the
    // shader outputs transparent pixels (alpha < 1) alongside opaque ones.
    let renderer, gl;
    try {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer = new Renderer({ canvas, alpha: true, premultipliedAlpha: false, dpr });
      gl = renderer.gl;
    } catch (err) {
      console.error('[WaterRipple] WebGL init failed:', err);
      return;
    }

    const initW = parent.clientWidth  || window.innerWidth;
    const initH = parent.clientHeight || window.innerHeight;
    renderer.setSize(initW, initH);

    // ── 2. Orthographic Camera ────────────────────────────────────────────────
    // Required by OGL's render call. The display shader doesn't use camera
    // matrices (it positions using clip-space coords directly), but we still
    // need to pass a camera object to renderer.render().
    const camera = new Camera(gl, { left: -1, right: 1, top: 1, bottom: -1 });
    camera.position.z = 1;

    // ── 3. Wave Simulation ────────────────────────────────────────────────────
    const sim = makeSimulation();

    // ── 4. Height Map Texture ─────────────────────────────────────────────────
    // Uploaded to the GPU on every frame with the latest wave heights.
    // OGL Texture wraps the raw WebGL texture and re-uploads when
    // needsUpdate is set to true.
    const heightTexture = new Texture(gl, {
      image:           sim.encode(), // initial upload — all flat (0.5 = neutral)
      width:           SIM_W,
      height:          SIM_H,
      generateMipmaps: false,
      minFilter:       gl.LINEAR,   // bilinear filtering for smooth wave gradients
      magFilter:       gl.LINEAR,
      wrapS:           gl.CLAMP_TO_EDGE,
      wrapT:           gl.CLAMP_TO_EDGE,
    });

    // ── 5. Full-Screen Display Mesh ───────────────────────────────────────────
    // OGL's Triangle is a single large triangle that covers the entire viewport.
    // The fragment shader runs on every pixel and decides what to draw.
    const scene   = new Transform();
    const geo     = new Triangle(gl);
    const program = new Program(gl, {
      vertex:   VERT,
      fragment: FRAG,
      uniforms: {
        uHeight:  { value: heightTexture },
        uSimSize: { value: [SIM_W, SIM_H] },
      },
      transparent: true,  // enables alpha blending so transparent pixels show through
      depthTest:   false, // 2-D effect — no depth needed
      depthWrite:  false,
    });
    const mesh = new Mesh(gl, { geometry: geo, program });
    mesh.setParent(scene);

    // ── 6. Pointer Tracking ───────────────────────────────────────────────────
    // Listen on document so the effect responds to cursor movement anywhere
    // on the page, even over content that sits in front of this canvas.
    let lastX = -9999, lastY = -9999;

    function onPointerMove(e) {
      // Only spawn a ripple if the cursor moved enough — avoids micro-jitter
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy < MOVE_THRESHOLD * MOVE_THRESHOLD) return;
      lastX = e.clientX;
      lastY = e.clientY;

      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Convert viewport pixel position to normalised 0–1 coordinates
      const normX = (e.clientX - rect.left) / rect.width;
      const normY = (e.clientY - rect.top)  / rect.height;
      sim.spawn(normX, normY);
    }

    document.addEventListener('pointermove', onPointerMove);

    // ── 7. Resize Handling ────────────────────────────────────────────────────
    // Keeps the renderer in sync if the browser window is resized.
    // The simulation grid stays at SIM_W × SIM_H regardless of screen size —
    // the shader scales it via the texture sampler.
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) renderer.setSize(width, height);
      }
    });
    ro.observe(parent);

    // ── 8. Animation Loop ─────────────────────────────────────────────────────
    // Each frame:
    //   a) advance the wave physics one step
    //   b) encode the new heights into RGBA bytes and push to the GPU
    //   c) render the fullscreen shader, which draws caustic highlights
    let rafId;
    function animate() {
      rafId = requestAnimationFrame(animate);

      sim.step();                          // propagate waves one frame
      heightTexture.image = sim.encode(); // encode heights → RGBA bytes
      heightTexture.needsUpdate = true;   // tell OGL to re-upload to GPU

      renderer.render({ scene, camera });
    }
    animate();

    // ── 9. Cleanup ────────────────────────────────────────────────────────────
    // Called when the component unmounts (e.g. navigating away).
    // Frees animation frame, observer, and GPU resources.
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      document.removeEventListener('pointermove', onPointerMove);
      canvas.width  = 0;
      canvas.height = 0;
    };
  }, []); // runs once on mount, cleans up on unmount

  return (
    <>
      {/*
        * IMPORTANT: .ripple-wrapper has NO position declaration here.
        * The external .ripple-full-page class (globals.css) sets position: fixed.
        * A scoped "position: relative" injected after the linked stylesheet would
        * override it and collapse the canvas to zero height — the root cause of
        * the previous invisible-canvas bug.
        */}
      <style>{`
        .ripple-wrapper { width: 100%; height: 100%; }
        .ripple-carrier {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .ripple-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>

      <div ref={wrapperRef} className={`ripple-wrapper${className ? ' ' + className : ''}`}>
        {/* Canvas layer — WebGL draws caustic highlights here */}
        <div className="ripple-carrier">
          <canvas ref={canvasRef} className="ripple-canvas" />
        </div>
        {/* No content layer needed — WaterRipple no longer wraps children */}
      </div>
    </>
  );
}
