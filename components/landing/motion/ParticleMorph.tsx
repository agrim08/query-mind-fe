"use client";

import { useEffect, useRef } from "react";

/**
 * A 3D particle sculpture on a 2D canvas: ~1,800 points morph between four shapes
 * while rotating. The cursor tilts the scene and pushes nearby particles away.
 * Pure math, no WebGL/three.js. Pauses when off-screen or the tab is hidden.
 */

const SHAPE_NAMES = ["sphere", "torus knot", "spiral galaxy", "ripple"] as const;
const PERIOD_S = 4.6; // each shape is held, then morphs into the next
const MORPH_SHARE = 0.4; // fraction of the period spent morphing
const TAU = Math.PI * 2;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOut = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2);

function sphere(n: number) {
  const out = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    out.set([Math.cos(golden * i) * r, y, Math.sin(golden * i) * r], i * 3);
  }
  return out;
}

function torusKnot(n: number) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU;
    const r = (Math.cos(3 * t) + 2) / 3;
    const j = () => (Math.random() - 0.5) * 0.12; // tube thickness
    out.set([r * Math.cos(2 * t) + j(), -Math.sin(3 * t) / 3 + j(), r * Math.sin(2 * t) + j()], i * 3);
  }
  return out;
}

function galaxy(n: number) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = Math.pow(Math.random(), 0.65) * 1.15;
    const angle = (i % 3) * (TAU / 3) + r * 3.4 + (Math.random() - 0.5) * 0.45;
    const y = (Math.random() - 0.5) * 0.16 * (1.2 - r);
    out.set([Math.cos(angle) * r, y, Math.sin(angle) * r], i * 3);
  }
  return out;
}

/** The ripple is alive: recomputed every frame from time `t`. */
function ripple(out: Float32Array, n: number, t: number) {
  const side = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const x = ((i % side) / side - 0.5) * 2.3;
    const z = (Math.floor(i / side) / side - 0.5) * 2.3;
    const d = Math.sqrt(x * x + z * z);
    out[i * 3] = x;
    out[i * 3 + 1] = Math.sin(d * 5.5 - t * 2.4) * 0.2 * Math.max(0, 1.25 - d * 0.6);
    out[i * 3 + 2] = z;
  }
  return out;
}

/** `scale`: shape radius as a fraction of the canvas's shorter side. */
export function ParticleMorph({ className, scale = 0.36 }: { className?: string; scale?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Denser on big stages so the larger shape doesn't look sparse; lighter on phones.
    const n = canvas.clientWidth < 420 ? 1100 : canvas.clientHeight > 600 ? 2400 : 1800;
    const statics = [sphere(n), torusKnot(n), galaxy(n)];
    const rippleBuf = new Float32Array(n * 3);
    const delay = Float32Array.from({ length: n }, () => Math.random());
    const isWhite = Uint8Array.from({ length: n }, (_, i) => (i % 9 === 0 ? 1 : 0));
    const styles = getComputedStyle(document.documentElement);
    const lime = styles.getPropertyValue("--accent").trim() || "lime";
    const white = styles.getPropertyValue("--text-primary").trim() || "white";

    let w = 0, h = 0, dpr = 1;
    let mx = 0, my = 0, tmx = 0, tmy = 0; // smoothed / target tilt in -1..1
    let px = -9999, py = -9999; // pointer in canvas px
    let visible = true, raf = 0, lastShape = -1;

    const shapeAt = (k: number, t: number) => (k === 3 ? ripple(rippleBuf, n, t) : statics[k]);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      const cycle = Math.floor(t / PERIOD_S);
      const to = cycle % 4;
      const from = (to + 3) % 4;
      const m = clamp01((t % PERIOD_S) / PERIOD_S / MORPH_SHARE);
      const a = shapeAt(from, t);
      const b = shapeAt(to, t);

      if (to !== lastShape && labelRef.current) {
        labelRef.current.textContent = `${SHAPE_NAMES[from]} → ${SHAPE_NAMES[to]}`;
        lastShape = to;
      }

      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      const rotY = t * 0.28 + mx * 0.7;
      const rotX = 0.42 + my * 0.4;
      const sy = Math.sin(rotY), cy = Math.cos(rotY), sx = Math.sin(rotX), cx = Math.cos(rotX);
      const unit = Math.min(w, h) * scale;
      const fov = 3.2;
      const radius = 70;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass === 0 ? lime : white;
        for (let i = 0; i < n; i++) {
          if (isWhite[i] !== pass) continue;
          const e = easeInOut(clamp01(m * 1.6 - delay[i] * 0.6));
          const j = i * 3;
          const x = a[j] + (b[j] - a[j]) * e;
          const y = a[j + 1] + (b[j + 1] - a[j + 1]) * e;
          const z = a[j + 2] + (b[j + 2] - a[j + 2]) * e;

          const x1 = x * cy + z * sy;
          const z1 = -x * sy + z * cy;
          const y1 = y * cx - z1 * sx;
          const z2 = y * sx + z1 * cx;

          const s = fov / (fov + z2);
          let sxp = w / 2 + x1 * unit * s;
          let syp = h / 2 + y1 * unit * s;

          const dx = sxp - px, dy = syp - py;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < radius && d > 0.001) {
            const push = (1 - d / radius) * 26;
            sxp += (dx / d) * push;
            syp += (dy / d) * push;
          }

          const depth = clamp01((1 - z2) / 2); // 1 = nearest
          ctx.globalAlpha = 0.12 + depth * (pass === 0 ? 0.7 : 0.85);
          const size = (pass === 0 ? 1.5 : 1.9) * s;
          ctx.fillRect(sxp - size / 2, syp - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now / 1000);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      px = e.clientX - rect.left;
      py = e.clientY - rect.top;
      tmx = (px / rect.width) * 2 - 1;
      tmy = (py / rect.height) * 2 - 1;
    };
    const onLeave = () => {
      px = py = -9999;
      tmx = tmy = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) draw(PERIOD_S * 0.9); // one still frame
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    resize();
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [scale]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <canvas ref={canvasRef} className="h-full w-full cursor-crosshair touch-none" aria-hidden />
      <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center font-mono text-[11px] text-fg-subtle">
        <span ref={labelRef}>sphere</span> · move your cursor
      </p>
    </div>
  );
}
