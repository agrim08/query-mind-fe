"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SqlHighlighter from "@/components/sql/SqlHighlighter";
import { Reveal } from "./motion/Reveal";
import { NumberTicker } from "./motion/NumberTicker";
import { SpotlightCard } from "./motion/SpotlightCard";
import { SectionHeading } from "./SectionHeading";

const ATTEMPT_QUESTION = "Delete every user with a test email";
const ATTEMPT_SQL = `DELETE FROM "users"\nWHERE "email" LIKE '%@test.com'`;

const LIMITS: { value: number | null; unit: string; title: string; body: string }[] = [
  { value: 1, unit: "statement", title: "One SELECT, nothing chained", body: "Multiple statements, DDL and data changes are rejected before anything runs." },
  { value: null, unit: "READ ONLY", title: "Read-only at the database", body: "Queries run inside a read-only transaction, so Postgres itself refuses writes." },
  { value: 10, unit: "seconds", title: "Runaway queries get stopped", body: "A statement timeout ends anything slow, so it can't tie up your database." },
  { value: 500, unit: "rows max", title: "Results stay small", body: "Rows are read through a cursor and capped, so a huge table can't flood anything." },
];

export function SafetySection() {
  return (
    <section id="safety" className="scroll-mt-16 border-t border-line-subtle py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <SectionHeading
          eyebrow="Safety"
          title={
            <>
              Write-protected.
              <br />
              <span className="text-fg-subtle">By design, not by promise.</span>
            </>
          }
          lead="You can only ask questions here. Operations that modify or delete data are blocked, in more than one place."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <Reveal>
            <BlockedAttempt />
          </Reveal>

          <div className="divide-y divide-line-subtle rounded-2xl border border-line-subtle">
            {LIMITS.map((l, i) => (
              <Reveal key={l.title} delay={i * 0.06} className="flex gap-5 px-5 py-4">
                <div className="w-[92px] shrink-0">
                  <div className="font-display text-[34px] font-extrabold leading-none tracking-[-0.04em] text-fg">
                    {l.value === null ? <ShieldCheck size={30} className="text-accent" /> : <NumberTicker value={l.value} />}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle">{l.unit}</div>
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-fg">{l.title}</h3>
                  <p className="mt-1 text-[14px] leading-[1.55] text-fg-muted">{l.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-5">
          <p className="font-mono text-[12px] text-fg-subtle">
            Connection strings are encrypted at rest and never sent to your browser or the AI model.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

type AttemptPhase = "ask" | "write" | "blocked";

/** Loops: someone asks for a destructive change → SQL appears → it's stopped. */
function BlockedAttempt() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [livePhase, setPhase] = useState<AttemptPhase>("ask");
  const [cycle, setCycle] = useState(0);
  const animating = inView && !reduce;
  const phase: AttemptPhase = animating ? livePhase : "blocked";

  useEffect(() => {
    if (!animating) return;
    const timers = [
      setTimeout(() => setPhase("write"), 1100),
      setTimeout(() => setPhase("blocked"), 2600),
      setTimeout(() => setCycle((c) => c + 1), 6500),
    ];
    return () => {
      timers.forEach(clearTimeout);
      setPhase("ask");
    };
  }, [animating, cycle]);

  return (
    <div ref={ref} className="h-full">
      <SpotlightCard className="h-full p-6" innerClassName="flex h-full flex-col">
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-subtle">What happens if someone tries</p>

        <div className="rounded-xl border border-line bg-raised px-4 py-3 text-[15px] text-fg">{ATTEMPT_QUESTION}</div>

        <div className="relative mt-4">
          <div
            className={`sql-block sql-block--black transition-opacity duration-500 [&_.sql-content]:text-[13px] ${
              phase === "ask" ? "opacity-30" : "opacity-100"
            } ${phase === "blocked" ? "border-danger/40" : ""}`}
          >
            <SqlHighlighter sql={phase === "ask" ? "" : ATTEMPT_SQL} streaming={phase === "write"} />
          </div>

          <AnimatePresence>
            {phase === "blocked" && (
              <motion.div
                key={cycle}
                initial={reduce ? false : { opacity: 0, scale: 1.25, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -4 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 16 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border-2 border-danger px-3 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em] text-danger"
              >
                Blocked
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 min-h-[64px]">
          <AnimatePresence>
            {phase === "blocked" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="flex items-start gap-3 rounded-xl border border-danger/25 bg-danger/[0.07] px-4 py-3"
              >
                <X size={16} className="mt-0.5 shrink-0 text-danger" />
                <div>
                  <p className="text-[15px] font-semibold text-fg">Write-protected.</p>
                  <p className="text-[13px] text-fg-muted">Nothing reached your database. Only questions can be asked here.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pinned to the bottom so the card fills the column's height with something useful. */}
        <DefenseTrail blocked={phase === "blocked"} />
      </SpotlightCard>
    </div>
  );
}

type LayerState = "passed" | "stopped" | "skipped" | "safe";

const LAYERS: { name: string; idle: string; done: string; state: LayerState }[] = [
  { name: "Question", idle: "plain English", done: "asks to delete", state: "passed" },
  { name: "Validator", idle: "checks the SQL", done: "stopped it: DELETE", state: "stopped" },
  { name: "Read-only txn", idle: "refuses writes", done: "never reached", state: "skipped" },
  { name: "Your database", idle: "your data", done: "untouched", state: "safe" },
];

/** The layers a destructive request runs into, lit up once it's blocked. */
function DefenseTrail({ blocked }: { blocked: boolean }) {
  return (
    <div className="mt-auto border-t border-line-subtle pt-5">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-subtle">Where it was stopped</p>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LAYERS.map((layer, i) => {
          const state = blocked ? layer.state : null;
          const tone =
            state === "stopped"
              ? "border-danger/50 bg-danger/[0.08]"
              : state === "safe"
                ? "border-ok/40 bg-ok/[0.06]"
                : state === "skipped"
                  ? "border-line-subtle opacity-50"
                  : "border-line-subtle";
          return (
            <motion.li
              key={layer.name}
              className={`rounded-lg border px-3 py-2.5 transition-[border-color,background-color,opacity] duration-500 ${tone}`}
              animate={state === "stopped" ? { scale: [1, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.45, delay: blocked ? i * 0.12 : 0 }}
            >
              <div className="flex items-center gap-1.5">
                {state === "stopped" && <X size={12} className="text-danger" />}
                {state === "safe" && <ShieldCheck size={12} className="text-ok" />}
                <span className="text-[13px] font-medium text-fg">{layer.name}</span>
              </div>
              <span
                className={`mt-0.5 block font-mono text-[10px] ${
                  state === "stopped" ? "text-danger" : state === "safe" ? "text-ok" : "text-fg-subtle"
                }`}
              >
                {blocked ? layer.done : layer.idle}
              </span>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
