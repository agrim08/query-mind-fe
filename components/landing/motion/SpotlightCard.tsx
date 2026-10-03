"use client";

import { useRef } from "react";

/**
 * Card with a soft light that follows the cursor (in the spirit of Aceternity's
 * card spotlight). Position is written to CSS variables, so it never re-renders React.
 */
export function SpotlightCard({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`group relative overflow-hidden rounded-2xl border border-line bg-surface ${className ?? ""}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(200, 240, 77, 0.07), transparent 60%)",
        }}
        aria-hidden
      />
      <div className={`relative ${innerClassName ?? ""}`}>{children}</div>
    </div>
  );
}
