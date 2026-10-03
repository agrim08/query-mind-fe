"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, KeyRound, Link2 } from "lucide-react";
import { useRef } from "react";
import { Reveal } from "./motion/Reveal";
import { useTypewriter } from "./motion/useTypewriter";
import { SectionHeading } from "./SectionHeading";

const PROMPT = "A blog with authors, posts and comments. Posts can have many comments.";

interface Node {
  name: string;
  x: number; // % of canvas width
  y: number; // % of canvas height
  cols: { name: string; type: string; key?: "pk" | "fk" }[];
}

const NODES: Node[] = [
  {
    name: "authors", x: 4, y: 8,
    cols: [{ name: "id", type: "uuid", key: "pk" }, { name: "name", type: "varchar" }, { name: "email", type: "varchar" }],
  },
  {
    name: "posts", x: 38, y: 46,
    cols: [{ name: "id", type: "uuid", key: "pk" }, { name: "author_id", type: "uuid", key: "fk" }, { name: "title", type: "varchar" }],
  },
  {
    name: "comments", x: 70, y: 6,
    cols: [{ name: "id", type: "uuid", key: "pk" }, { name: "post_id", type: "uuid", key: "fk" }, { name: "body", type: "text" }],
  },
];

// Curves in a 100 x 100 box, drawn with a non-scaling stroke.
// authors.id → posts.author_id, posts.id → comments.post_id
const EDGES = ["M 19 31 C 19 50, 27 58, 38 58", "M 68 58 C 79 58, 84 44, 84 30"];

export function DesignerSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const { visible, done } = useTypewriter(PROMPT, inView && !reduce, 1, 28);
  const drawn = reduce || (inView && done);

  return (
    <section id="designer" className="scroll-mt-16 border-t border-line-subtle py-24 md:py-32">
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <SectionHeading
            eyebrow="Schema Designer"
            title="Design your next database."
            lead="Describe the tables you need in plain English. We'll generate the complete schema as a diagram you can edit, then export it as SQL or PDF."
          />
          <Reveal delay={0.1}>
            <Link
              href="/design"
              className="group mt-9 inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-[15px] text-fg transition-colors hover:border-line-strong hover:bg-raised"
            >
              Try the Schema Designer
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div ref={ref} className="rounded-3xl border border-line-subtle bg-surface p-4 sm:p-5">
          <div className="rounded-xl border border-line bg-raised px-4 py-3 font-mono text-[12px] leading-[1.6] text-fg-muted">
            <span className="text-fg-subtle">prompt › </span>
            {reduce ? PROMPT : visible}
            {!done && !reduce && <span className="qm-caret" />}
          </div>

          <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-xl border border-line-subtle">
            <div className="qm-dot-grid absolute inset-0 opacity-70 [mask-image:none]" aria-hidden />

            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              {EDGES.map((d, i) => (
                <motion.path
                  key={d}
                  d={d}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={drawn ? { pathLength: 1, opacity: 0.8 } : {}}
                  transition={{ delay: 0.9 + i * 0.35, duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                />
              ))}
            </svg>

            {NODES.map((n, i) => (
              <motion.div
                key={n.name}
                className="absolute w-[30%] min-w-[120px] overflow-hidden rounded-lg border border-line bg-surface shadow-[0_12px_30px_-12px_rgba(0,0,0,0.8)]"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                initial={reduce ? false : { opacity: 0, y: 16, scale: 0.92 }}
                animate={drawn ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: i * 0.18, type: "spring", stiffness: 260, damping: 22 }}
              >
                <div className="border-b border-line bg-accent/[0.07] px-3 py-1.5 font-display text-[13px] font-bold text-fg">
                  {n.name}
                </div>
                {n.cols.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] text-fg-muted">
                    {c.key === "pk" && <KeyRound size={10} className="text-warn" />}
                    {c.key === "fk" && <Link2 size={10} className="text-accent" />}
                    <span className={c.key ? "text-fg" : ""}>{c.name}</span>
                    <span className="ml-auto text-fg-subtle">{c.type}</span>
                  </div>
                ))}
              </motion.div>
            ))}

            <motion.div
              className="absolute bottom-3 right-3 flex gap-2"
              initial={reduce ? false : { opacity: 0 }}
              animate={drawn ? { opacity: 1 } : {}}
              transition={{ delay: 1.8 }}
            >
              {["Export .sql", "Export PDF"].map((label) => (
                <span key={label} className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[10px] text-fg-muted">
                  {label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
