"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, CornerDownLeft, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SqlHighlighter from "@/components/sql/SqlHighlighter";
import { DEMO_QUERIES, type DemoQuery } from "./content";
import { BorderBeam } from "./motion/BorderBeam";

/* Mirrors the real query stream: status → sql_chunk → validate → results. */
type Phase = "ask" | "find" | "write" | "check" | "result";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function PipelineDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduce = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [livePhase, setPhase] = useState<Phase>("ask");
  const [liveQuestion, setQuestion] = useState("");
  const [liveSql, setSql] = useState("");
  const demo = DEMO_QUERIES[index];

  // Reduced-motion users, and anyone who has scrolled past, see a still, complete frame.
  const animating = inView && !reduce;
  const phase: Phase = animating ? livePhase : "result";
  const question = animating ? liveQuestion : demo.question;
  const sql = animating ? liveSql : demo.sql;

  useEffect(() => {
    if (!animating) return;
    const q = DEMO_QUERIES[index];
    let cancelled = false;
    (async () => {
      await sleep(250);
      for (let n = 1; n <= q.question.length; n++) {
        if (cancelled) return;
        setQuestion(q.question.slice(0, n));
        await sleep(26);
      }
      await sleep(350);
      if (cancelled) return;
      setPhase("find");
      await sleep(1000);
      if (cancelled) return;
      setPhase("write");
      for (let n = 3; n < q.sql.length + 3; n += 3) {
        if (cancelled) return;
        setSql(q.sql.slice(0, n));
        await sleep(14);
      }
      await sleep(300);
      if (cancelled) return;
      setPhase("check");
      await sleep(800);
      if (cancelled) return;
      setPhase("result");
      await sleep(4800);
      if (!cancelled) setIndex((i) => (i + 1) % DEMO_QUERIES.length);
    })();
    return () => {
      // Runs when the example changes or the demo leaves the screen: start the next run clean.
      cancelled = true;
      setPhase("ask");
      setQuestion("");
      setSql("");
    };
  }, [index, animating]);

  return (
    <div ref={ref}>
      <BorderBeam className="shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]" innerClassName="bg-surface">
        <div className="p-5">
          {/* Question */}
          <div className="flex items-center gap-3 rounded-xl border border-line bg-raised px-4 py-3.5">
            <span className="min-h-[1.5em] flex-1 text-[15px] text-fg">
              {question}
              {phase === "ask" && <span className="qm-caret" />}
            </span>
            <CornerDownLeft size={14} className="shrink-0 text-fg-subtle" aria-hidden />
          </div>

          {/* One status line instead of a row of step boxes */}
          <div className="mb-3 mt-4 h-5">
            <StatusLine phase={phase} demo={demo} />
          </div>

          {/* One panel: SQL while it's written, then the answer */}
          <div className="sql-block sql-block--black relative h-[232px]">
            <AnimatePresence mode="wait" initial={false}>
              {phase === "result" ? (
                <motion.div
                  key={`result-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="h-full"
                >
                  <ResultTable demo={demo} />
                </motion.div>
              ) : (
                <motion.div
                  key={`sql-${index}`}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="h-full [&_.sql-content]:text-[12px] [&_.sql-content]:leading-[1.7]"
                >
                  {sql ? (
                    <SqlHighlighter sql={sql} streaming={phase === "write"} />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-[11px] text-fg-subtle">
                      {phase === "find" ? "searching your schema…" : "ask anything"}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Example switcher: quiet dots, not tabs */}
          <div className="mt-4 flex items-center justify-center gap-2" role="tablist" aria-label="Example questions">
            {DEMO_QUERIES.map((q, i) => (
              <button
                key={q.question}
                role="tab"
                aria-selected={i === index}
                aria-label={`Example: ${q.question}`}
                onClick={() => setIndex(i)}
                className="group p-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-5 bg-accent" : "w-1.5 bg-line-strong group-hover:bg-fg-subtle"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </BorderBeam>
    </div>
  );
}

const STATUS: Record<Exclude<Phase, "ask">, string> = {
  find: "Finding the right tables",
  write: "Writing SQL",
  check: "Checking it's read-only",
  result: "",
};

function StatusLine({ phase, demo }: { phase: Phase; demo: DemoQuery }) {
  if (phase === "ask") return null;
  const done = phase === "result";
  const usedTables = demo.tables.filter((t) => t.used).map((t) => t.name);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={phase}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 font-mono text-[11px] text-fg-muted"
      >
        {done ? (
          <>
            <Check size={12} className="text-accent" />
            <span className="text-fg">{demo.rows.length} rows</span>
            <span className="text-fg-subtle">· {demo.ms} ms · read-only · {usedTables.join(", ")}</span>
          </>
        ) : (
          <>
            <Loader2 size={12} className="animate-spin text-accent" />
            {STATUS[phase]}…
          </>
        )}
      </motion.p>
    </AnimatePresence>
  );
}

function ResultTable({ demo }: { demo: DemoQuery }) {
  const cols = { gridTemplateColumns: `repeat(${demo.columns.length}, minmax(0, 1fr))` };
  return (
    <div className="flex h-full flex-col">
      <p className="truncate border-b border-line-subtle px-4 py-2 font-mono text-[11px] text-fg-subtle">
        {demo.sql.split("\n")[0]} …
      </p>
      <div className="grid px-4 pb-1 pt-3" style={cols}>
        {demo.columns.map((c) => (
          <span key={c} className="font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle">
            {c}
          </span>
        ))}
      </div>
      {demo.rows.map((row, r) => (
        <motion.div
          key={r}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + r * 0.07, duration: 0.3 }}
          className="grid px-4 py-[7px]"
          style={cols}
        >
          {row.map((cell, c) => (
            <span
              key={c}
              className={`truncate text-[14px] ${c === row.length - 1 ? "font-mono text-[13px] text-fg" : "text-fg-muted"}`}
            >
              {cell}
            </span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
