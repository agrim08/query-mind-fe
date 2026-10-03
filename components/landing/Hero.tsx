"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { PROVIDERS } from "./content";
import { DotGlowBackground } from "./motion/DotGlowBackground";
import { Marquee } from "./motion/Marquee";
import { WordReveal } from "./motion/WordReveal";
import { PipelineDemo } from "./PipelineDemo";
import { useIsSignedIn } from "./useIsSignedIn";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const signedIn = useIsSignedIn();
  const fade = (delay: number) =>
    reduce
      ? {}
      : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, delay, ease: EASE_OUT },
      };

  return (
    // On desktop the hero is exactly one screen (minus the 64px nav), content centered,
    // so the CTA is always above the fold.
    <section className="relative flex flex-col overflow-hidden lg:min-h-[calc(100svh-4rem)]">
      <DotGlowBackground radius={130} />

      <div className="relative mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-12 px-5 pb-12 pt-10 md:px-8 md:pt-12 lg:grid-cols-2">
        <div>
          <motion.p {...fade(0)} className="mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle">
            For Postgres <span className="mx-2 text-line-strong">/</span> Read-only by design
          </motion.p>

          {/* Two deliberate lines at 48px (smaller only on narrow phones). */}
          <h1 className="font-display text-[clamp(34px,9vw,48px)] font-extrabold leading-[1.02] tracking-[-0.045em] text-fg">
            <WordReveal text="Query your database" />
            <br className="hidden sm:block" />{" "}
            <WordReveal text="in" delay={0.18} />{" "}
            <span className="relative inline-block text-accent">
              <WordReveal text="plain English." delay={0.3} />
              <HandUnderline />
            </span>
          </h1>

          <motion.p
            {...fade(0.55)}
            className="mt-6 max-w-[40ch] text-[clamp(17px,1.35vw,20px)] font-[360] leading-[1.5] text-fg-muted"
          >
            Connect your database. Ask your question. Get the answer.{" "}
            <span className="text-fg">No SQL. No developer. No waiting.</span>
          </motion.p>

          {/* No entrance animation: the primary action must be visible at first paint, even before JS. */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href={signedIn ? "/dashboard" : "/sign-up"}
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-[15px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {signedIn ? "Open dashboard" : "Start free"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 text-[15px] text-fg-muted transition-colors hover:text-fg"
            >
              See how it works
              <ArrowDown size={15} className="transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: EASE_OUT }}
          className="min-w-0"
        >
          <PipelineDemo />
        </motion.div>
      </div>

      {/* Works with */}
      <div className="relative border-y border-line-subtle py-4">
        <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-5 md:px-8">
          <span className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle sm:block">
            Works with any Postgres
          </span>
          <Marquee duration={45} gap={40} className="min-w-0 flex-1">
            {PROVIDERS.map((p) => (
              <span key={p} className="whitespace-nowrap text-[15px] font-medium text-fg-muted">
                {p}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

/** A hand-drawn underline that draws itself under "plain English." */
function HandUnderline() {
  const reduce = useReducedMotion();
  return (
    <svg
      className="pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.28em] w-full overflow-visible"
      viewBox="0 0 300 20"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        d="M3 14 C 60 6, 120 4, 180 8 S 270 14, 297 6"
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.9 }}
        transition={{ duration: 0.9, delay: 0.9, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}
