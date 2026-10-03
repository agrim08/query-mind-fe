"use client";

import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import { STEPS } from "./content";
import { Reveal } from "./motion/Reveal";
import { SectionHeading } from "./SectionHeading";
import { STEP_VISUALS } from "./StepVisuals";

/**
 * Desktop: a tall section with a sticky stage. Scroll position picks the active
 * step; the visual on the right swaps with it. Mobile: steps simply stack.
 */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t border-line-subtle">
      <div className="mx-auto max-w-[1200px] px-5 pt-24 md:px-8 md:pt-32">
        <SectionHeading
          eyebrow="How it works"
          title="From question to answer, in four honest steps."
          lead="Nothing hidden behind a spinner. Every step the product takes is a step you can see."
        />
      </div>
      <StickySteps />
      <StackedSteps />
    </section>
  );
}

function StickySteps() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length))));
  });

  const Visual = STEP_VISUALS[active];

  return (
    <div ref={ref} className="relative hidden lg:block" style={{ height: `${STEPS.length * 85}vh` }}>
      <div className="sticky top-0 flex h-screen items-center">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-16 px-8">
          <ol className="relative space-y-2 pl-6">
            {/* progress rail */}
            <div className="absolute bottom-2 left-0 top-2 w-px bg-line" aria-hidden />
            <motion.div
              className="absolute left-0 top-2 w-px origin-top bg-accent"
              style={{ scaleY: scrollYProgress, height: "calc(100% - 16px)" }}
              aria-hidden
            />
            {STEPS.map((step, i) => {
              const isActive = i === active;
              return (
                <li key={step.label} className="py-3">
                  <div className="flex items-baseline gap-4">
                    <span className={`font-mono text-[12px] transition-colors ${isActive ? "text-accent" : "text-fg-subtle"}`}>
                      0{i + 1}
                    </span>
                    <h3
                      className={`font-display text-[28px] font-bold leading-tight tracking-[-0.03em] transition-colors duration-300 ${
                        isActive ? "text-fg" : "text-fg-subtle"
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="ml-9 max-w-[44ch] overflow-hidden pt-3 text-[17px] font-[360] leading-[1.6] text-fg-muted"
                      >
                        {step.body}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>

          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl border border-line-subtle bg-surface p-7"
              >
                <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-subtle">
                  Step 0{active + 1} · {STEPS[active].label}
                </p>
                <Visual />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function StackedSteps() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-16 px-5 py-20 md:px-8 lg:hidden">
      {STEPS.map((step, i) => {
        const Visual = STEP_VISUALS[i];
        return (
          <Reveal key={step.label}>
            <span className="font-mono text-[12px] text-accent">0{i + 1}</span>
            <h3 className="mt-2 font-display text-[28px] font-bold leading-tight tracking-[-0.03em] text-fg">
              {step.title}
            </h3>
            <p className="mt-3 text-[17px] font-[360] leading-[1.6] text-fg-muted">{step.body}</p>
            <MountInView className="mt-6 min-h-[280px] rounded-3xl border border-line-subtle bg-surface p-5">
              <Visual />
            </MountInView>
          </Reveal>
        );
      })}
    </div>
  );
}

/** Mounts children only once visible, so their entrance animations play on screen. */
function MountInView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} className={className}>
      {inView ? children : null}
    </div>
  );
}
