"use client";

import { motion } from "framer-motion";
import { Check, Database } from "lucide-react";
import SqlHighlighter from "@/components/sql/SqlHighlighter";
import { DEMO_QUERIES } from "./content";
import { useTypewriter } from "./motion/useTypewriter";

const SCHEMA = [
  { name: "customers", cols: ["id", "name", "email"] },
  { name: "orders", cols: ["id", "customer_id", "total"] },
  { name: "order_items", cols: ["order_id", "sku", "qty"] },
  { name: "products", cols: ["sku", "title", "price"] },
  { name: "refunds", cols: ["id", "order_id", "amount"] },
  { name: "users", cols: ["id", "email", "created_at"] },
];

const pop = (i: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
});

/** Step 1: the schema is read and indexed; rows are not copied. */
export function MapVisual() {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SCHEMA.map((t, i) => (
          <motion.div key={t.name} {...pop(i)} className="rounded-xl border border-line bg-raised p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[12px] text-fg">{t.name}</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08, type: "spring", stiffness: 400, damping: 20 }}
              >
                <Check size={12} className="text-accent" />
              </motion.span>
            </div>
            {t.cols.map((c) => (
              <div key={c} className="font-mono text-[11px] leading-[1.7] text-fg-subtle">
                {c}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
      <motion.p {...pop(7)} className="mt-5 font-mono text-[11px] text-fg-muted">
        6 tables · 18 columns indexed · <span className="text-accent">0 rows copied</span>
      </motion.p>
    </div>
  );
}

/** Step 2: the question is matched against the index; low scores are left out. */
export function FindVisual() {
  const demo = DEMO_QUERIES[0];
  const all = [...demo.tables, { name: "products", score: 0.33, used: false }];
  return (
    <div>
      <motion.div {...pop(0)} className="mb-6 rounded-xl border border-line bg-raised px-4 py-3 text-[15px] text-fg">
        {demo.question}
      </motion.div>
      <div className="space-y-3">
        {all.map((t, i) => (
          <motion.div key={t.name} {...pop(i + 1)} className="flex items-center gap-4">
            <span className={`w-24 font-mono text-[12px] ${t.used ? "text-fg" : "text-fg-subtle"}`}>{t.name}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
              <motion.div
                className={`h-full rounded-full ${t.used ? "bg-accent" : "bg-line-strong"}`}
                initial={{ width: 0 }}
                animate={{ width: `${t.score * 100}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className={`w-10 text-right font-mono text-[12px] ${t.used ? "text-accent" : "text-fg-subtle"}`}>
              {t.score.toFixed(2)}
            </span>
          </motion.div>
        ))}
      </div>
      <motion.p {...pop(6)} className="mt-6 font-mono text-[11px] text-fg-muted">
        2 tables sent to the model · the rest stay out of the prompt
      </motion.p>
    </div>
  );
}

/** Step 3: SQL streams in. */
export function WriteVisual() {
  const { visible, done } = useTypewriter(DEMO_QUERIES[0].sql, true, 3, 20);
  return (
    <div className="sql-block sql-block--black">
      <div className="sql-block-header">
        <span className="font-mono text-[11px] text-fg-subtle">{done ? "sql query" : "generating sql"}</span>
        <span className="font-mono text-[10px] text-fg-subtle">gemini-2.5-flash</span>
      </div>
      <div className="h-[230px] [&_.sql-content]:text-[12px]">
        <SqlHighlighter sql={visible} streaming={!done} />
      </div>
    </div>
  );
}

const CHECKS = [
  "Exactly one SELECT statement",
  "Only tables from your schema",
  "No writes, locks or side-effect functions",
  "Runs in a READ ONLY transaction",
  "Stopped after 10 seconds",
  "Returns at most 500 rows",
];

/** Step 4: validation checklist, then a read-only run. */
export function RunVisual() {
  return (
    <div className="rounded-2xl border border-line bg-raised p-5">
      <ul className="space-y-3">
        {CHECKS.map((c, i) => (
          <motion.li key={c} {...pop(i)} className="flex items-center gap-3 text-[15px] text-fg">
            <motion.span
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 380, damping: 18 }}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15"
            >
              <Check size={12} className="text-accent" />
            </motion.span>
            {c}
          </motion.li>
        ))}
      </ul>
      <motion.div
        {...pop(CHECKS.length + 1)}
        className="mt-5 flex items-center gap-2 border-t border-line pt-4 font-mono text-[11px] text-fg-muted"
      >
        <Database size={12} className="text-ok" />
        <span className="text-ok">4 rows</span> · 84 ms · nothing written
      </motion.div>
    </div>
  );
}

export const STEP_VISUALS = [MapVisual, FindVisual, WriteVisual, RunVisual];
