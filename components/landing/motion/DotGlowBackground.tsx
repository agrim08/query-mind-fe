"use client";

import { useEffect, useRef } from "react";

/**
 * Dot-grid background whose dots light up around the mouse cursor.
 * The grey grid is always visible; a white copy of it is revealed inside a circle
 * of `radius` px that follows the pointer. Listens on the parent element, so the
 * layer itself stays pointer-events: none and never blocks clicks.
 */
export function DotGlowBackground({ radius = 130, className }: { radius?: number; className?: string }) {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const host = glow?.parentElement?.parentElement;
    if (!glow || !host) return;

    let frame = 0;
    let x = 0, y = 0;

    const paint = () => {
      frame = 0;
      glow.style.setProperty("--glow-x", `${x}px`);
      glow.style.setProperty("--glow-y", `${y}px`);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return; // hover effect only; touch has no cursor
      const rect = glow.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      glow.dataset.active = "true";
      if (!frame) frame = requestAnimationFrame(paint); // at most one style write per frame
    };
    const onLeave = () => {
      glow.dataset.active = "false";
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 ${className ?? ""}`} aria-hidden>
      <div className="qm-dot-grid absolute inset-0 opacity-60" />
      <div
        ref={glowRef}
        className="qm-dot-glow absolute inset-0"
        style={{ "--glow-radius": `${radius}px` } as React.CSSProperties}
      />
    </div>
  );
}
