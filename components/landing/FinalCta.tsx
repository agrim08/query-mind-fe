"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { GITHUB_REPO_URL, GitHubLink } from "./GitHubLink";
import { ParticleMorph } from "./motion/ParticleMorph";
import { Reveal } from "./motion/Reveal";
import { useIsSignedIn } from "./useIsSignedIn";

const FOOTER_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#safety", label: "Safety" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function FinalCta() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const signedIn = useIsSignedIn();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // The oversized wordmark rises into place as the footer scrolls in.
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["40%", "0%"]);

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-line-subtle">
      <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-12 md:px-8 md:pt-16">
        <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <Reveal>
              <h2 className="font-display text-[clamp(34px,9vw,48px)] font-extrabold leading-[1.02] tracking-[-0.05em] text-fg">
                Stop waiting.
                <br />
                <span className="text-accent">Start asking.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-7 max-w-[40ch] text-[clamp(17px,1.4vw,20px)] font-[360] leading-[1.55] text-fg-muted">
                Your database already has the answers. Connect it in about a minute and ask your first question.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href={signedIn ? "/dashboard" : "/sign-up"}
                  className="group inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-4 text-[16px] font-semibold text-canvas transition-transform hover:-translate-y-0.5"
                >
                  {signedIn ? "Open dashboard" : "Start free"}
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <GitHubLink className="text-[15px]" />
              </div>
            </Reveal>
          </div>

          {/* The stage bleeds past the content column on wide screens; the footer clips it. */}
          <Reveal delay={0.1} className="lg:-mr-24 xl:-mr-44">
            <ParticleMorph className="h-[420px] w-full sm:h-[520px] lg:h-[680px]" scale={0.44} />
          </Reveal>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-line-subtle pt-8">
          <span className="font-mono text-[12px] text-fg-subtle">© {new Date().getFullYear()} QueryMind</span>
          <nav className="flex flex-wrap gap-6" aria-label="Footer">
            {FOOTER_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-[14px] text-fg-subtle transition-colors hover:text-fg">
                {l.label}
              </a>
            ))}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-fg-subtle transition-colors hover:text-fg"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>

      <motion.div
        style={{ y }}
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[22vw] font-extrabold leading-[0.8] tracking-[-0.06em] text-raised"
      >
        QueryMind
      </motion.div>
    </footer>
  );
}
