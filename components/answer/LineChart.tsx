"use client";

import { useMemo, useState } from "react";
import { scaleLinear } from "d3-scale";
import { motion, useReducedMotion } from "framer-motion";
import { formatTick, formatValue, seriesColor, useElementWidth } from "./chartUtils";

interface Series {
  name: string;
  values: (number | null)[];
}

interface LineChartProps {
  labels: string[];
  series: Series[];
  xLabel: string;
}

const HEIGHT = 260;
const MARGIN = { top: 16, right: 64, bottom: 28, left: 48 };
const MAX_X_TICKS = 6;

/** Path through a series' points, broken where values are missing. */
function linePath(values: (number | null)[], x: (i: number) => number, y: (v: number) => number): string {
  let path = "";
  let penDown = false;
  values.forEach((v, i) => {
    if (v === null) {
      penDown = false;
      return;
    }
    path += `${penDown ? "L" : "M"}${x(i)},${y(v)}`;
    penDown = true;
  });
  return path;
}

export default function LineChart({ labels, series, xLabel }: LineChartProps) {
  const [frameRef, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const innerWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const { x, y, ticks } = useMemo(() => {
    const all = series.flatMap((s) => s.values).filter((v): v is number => v !== null);
    const yScale = scaleLinear()
      .domain([Math.min(0, ...all), Math.max(0, ...all)])
      .nice()
      .range([innerHeight, 0]);
    const xScale = scaleLinear().domain([0, Math.max(1, labels.length - 1)]).range([0, innerWidth]);
    return { x: (i: number) => xScale(i), y: (v: number) => yScale(v), ticks: yScale.ticks(4) };
  }, [series, labels.length, innerWidth, innerHeight]);

  const xTickEvery = Math.max(1, Math.ceil(labels.length / MAX_X_TICKS));
  const single = series.length === 1;

  const pick = (clientX: number, rect: DOMRect) => {
    const position = (clientX - rect.left - MARGIN.left) / Math.max(1, innerWidth);
    setActive(Math.min(labels.length - 1, Math.max(0, Math.round(position * (labels.length - 1)))));
  };

  const lastIndex = (values: (number | null)[]) => {
    for (let i = values.length - 1; i >= 0; i--) if (values[i] !== null) return i;
    return -1;
  };

  return (
    <div className="chart-frame" ref={frameRef}>
      {!single && (
        <div className="chart-legend" style={{ marginBottom: 8 }}>
          {series.map((s, i) => (
            <span key={s.name} className="chart-tooltip-row">
              <span className="chart-key" style={{ background: seriesColor(i, series.length) }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Line chart of ${series.map((s) => s.name).join(", ")} by ${xLabel}. Use the arrow keys to read values.`}
          tabIndex={0}
          onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            e.preventDefault();
            const step = e.key === "ArrowRight" ? 1 : -1;
            setActive((i) => Math.min(labels.length - 1, Math.max(0, (i ?? (step > 0 ? -1 : labels.length)) + step)));
          }}
        >
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {ticks.map((t) => (
              <g key={t} transform={`translate(0,${y(t)})`}>
                <line x2={innerWidth} stroke="var(--chart-grid)" strokeWidth={1} />
                <text x={-8} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--chart-axis-text)">
                  {formatTick(t)}
                </text>
              </g>
            ))}
            {labels.map((label, i) =>
              i % xTickEvery === 0 || i === labels.length - 1 ? (
                <text key={i} x={x(i)} y={innerHeight + 18} textAnchor="middle" fontSize={11} fill="var(--chart-axis-text)">
                  {label}
                </text>
              ) : null,
            )}

            {series.map((s, si) => {
              const color = seriesColor(si, series.length);
              const d = linePath(s.values, x, y);
              const end = lastIndex(s.values);
              return (
                <g key={s.name}>
                  {single && d && (
                    <path
                      d={`${d}L${x(end)},${y(0)}L${x(s.values.findIndex((v) => v !== null))},${y(0)}Z`}
                      fill={color}
                      opacity={0.1}
                    />
                  )}
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                  {end >= 0 && (
                    <>
                      <circle cx={x(end)} cy={y(s.values[end]!)} r={4} fill={color} stroke="var(--bg-surface)" strokeWidth={2} />
                      {single && (
                        <text x={x(end) + 10} y={y(s.values[end]!)} dy="0.32em" fontSize={12} fill="var(--text-secondary)">
                          {formatValue(s.values[end])}
                        </text>
                      )}
                    </>
                  )}
                </g>
              );
            })}

            {active !== null && (
              <g pointerEvents="none">
                <line x1={x(active)} x2={x(active)} y2={innerHeight} stroke="var(--border-emphasis)" strokeWidth={1} />
                {series.map((s, si) =>
                  s.values[active] !== null ? (
                    <circle
                      key={s.name}
                      cx={x(active)}
                      cy={y(s.values[active]!)}
                      r={4}
                      fill={seriesColor(si, series.length)}
                      stroke="var(--bg-surface)"
                      strokeWidth={2}
                    />
                  ) : null,
                )}
              </g>
            )}
          </g>
        </svg>
      )}
      {active !== null && width > 0 && (
        <div className="chart-tooltip" style={{ left: MARGIN.left + x(active), top: MARGIN.top + 4 }}>
          <div style={{ marginBottom: 2 }}>{labels[active]}</div>
          {series.map((s, si) => (
            <div key={s.name} className="chart-tooltip-row">
              <span className="chart-key" style={{ background: seriesColor(si, series.length) }} />
              <strong>{formatValue(s.values[active])}</strong>
              {!single && <span>{s.name}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
