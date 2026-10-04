"use client";

import { useMemo, useState } from "react";
import { scaleLinear } from "d3-scale";
import { motion, useReducedMotion } from "framer-motion";
import { formatTick, formatValue, useElementWidth } from "./chartUtils";

interface BarChartProps {
  labels: string[];
  values: (number | null)[];
  valueLabel: string;
}

const BAR = 20; // ≤ 24px thick; the rest of the band is air
const ROW = 34;
const RADIUS = 4;
const MARGIN = { top: 4, right: 72, bottom: 24, left: 8 };
const LABEL_WIDTH_MAX = 180;

/** A horizontal bar with a rounded data-end and a square end at the baseline. */
function barPath(x0: number, x1: number, y: number, height: number): string {
  const right = x1 >= x0;
  const length = Math.abs(x1 - x0);
  const r = Math.min(RADIUS, length, height / 2);
  if (length === 0) return "";
  if (right) {
    return `M${x0},${y}H${x1 - r}Q${x1},${y} ${x1},${y + r}V${y + height - r}Q${x1},${y + height} ${x1 - r},${y + height}H${x0}Z`;
  }
  return `M${x0},${y}H${x1 + r}Q${x1},${y} ${x1},${y + r}V${y + height - r}Q${x1},${y + height} ${x1 + r},${y + height}H${x0}Z`;
}

/** Horizontal bars: category labels stay readable however long they are. */
export default function BarChart({ labels, values, valueLabel }: BarChartProps) {
  const [frameRef, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const labelWidth = Math.min(LABEL_WIDTH_MAX, Math.max(60, width * 0.3));
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right - labelWidth);
  const height = MARGIN.top + MARGIN.bottom + labels.length * ROW;

  const { x, ticks } = useMemo(() => {
    const present = values.filter((v): v is number => v !== null);
    const scale = scaleLinear()
      .domain([Math.min(0, ...present), Math.max(0, ...present)])
      .nice()
      .range([0, innerWidth]);
    return { x: scale, ticks: scale.ticks(4) };
  }, [values, innerWidth]);

  return (
    <div className="chart-frame" ref={frameRef}>
      {width > 0 && (
        <svg width={width} height={height} role="group" aria-label={`Bar chart of ${valueLabel}`}>
          <g role="list" transform={`translate(${MARGIN.left + labelWidth},${MARGIN.top})`}>
            {ticks.map((t) => (
              <g key={t} transform={`translate(${x(t)},0)`}>
                <line y2={labels.length * ROW} stroke="var(--chart-grid)" strokeWidth={1} />
                <text y={labels.length * ROW + 16} textAnchor="middle" fontSize={11} fill="var(--chart-axis-text)">
                  {formatTick(t)}
                </text>
              </g>
            ))}
            {labels.map((label, i) => {
              const value = values[i];
              const top = i * ROW + (ROW - BAR) / 2;
              const isActive = active === i;
              return (
                <g
                  key={`${label}-${i}`}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`${label}: ${formatValue(value)}`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  style={{ outline: "none" }}
                >
                  {/* Hit target: the whole row, bigger than the bar. */}
                  <rect x={-labelWidth} y={i * ROW} width={labelWidth + innerWidth + MARGIN.right} height={ROW} fill="transparent" />
                  <text x={-10} y={top + BAR / 2} dy="0.32em" textAnchor="end" fontSize={12} fill="var(--text-secondary)">
                    {label.length > 26 ? `${label.slice(0, 25)}…` : label}
                  </text>
                  {value !== null && (
                    <>
                      <motion.path
                        d={barPath(x(0), x(value), top, BAR)}
                        fill="var(--accent)"
                        opacity={active === null || isActive ? 1 : 0.55}
                        initial={reduceMotion ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        style={{ transformOrigin: `${x(0)}px 0px` }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: reduceMotion ? 0 : i * 0.03 }}
                      />
                      <text
                        x={x(value) + (value >= 0 ? 8 : -8)}
                        y={top + BAR / 2}
                        dy="0.32em"
                        textAnchor={value >= 0 ? "start" : "end"}
                        fontSize={12}
                        fill={isActive ? "var(--text-primary)" : "var(--text-secondary)"}
                      >
                        {formatValue(value)}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      )}
    </div>
  );
}
