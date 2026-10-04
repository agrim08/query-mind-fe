"use client";

import { useEffect, useRef, useState } from "react";

/** Series colours in fixed order (validated palette in globals.css). One series uses the accent. */
export function seriesColor(index: number, seriesCount: number): string {
  if (seriesCount === 1) return "var(--accent)";
  return `var(--series-${(index % 4) + 1})`;
}

const full = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

/** A value as people read it: 1,284 · 12,345.67. */
export function formatValue(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : full.format(value);
}

/** Axis ticks: 0 · 1.2K · 3.4M. */
export function formatTick(value: number): string {
  return Math.abs(value) >= 10_000 ? compact.format(value) : full.format(value);
}

/** Width of an element, kept up to date as it resizes. */
export function useElementWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    setWidth(element.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
