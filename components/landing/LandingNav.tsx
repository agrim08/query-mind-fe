"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { GitHubLink } from "./GitHubLink";
import { useIsSignedIn } from "./useIsSignedIn";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#safety", label: "Safety" },
  { href: "#designer", label: "Schema Designer" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const signedIn = useIsSignedIn();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12));

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? "border-b border-line-subtle bg-canvas/75 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-8 px-5 md:px-8">
        <Link href="/" className="shrink-0" aria-label="QueryMind home">
          <Image src="/logo-horizontal.svg" alt="QueryMind" width={124} height={22} priority />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-[14px] text-fg-muted transition-colors hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <GitHubLink compact className="rounded-md p-2 sm:hidden" />
          <GitHubLink className="hidden rounded-md px-3 py-1.5 text-[14px] sm:inline-flex" />
          {!signedIn && (
            <Link href="/sign-in" className="px-3 py-1.5 text-[14px] text-fg-muted transition-colors hover:text-fg">
              Sign in
            </Link>
          )}
          <Link
            href={signedIn ? "/dashboard" : "/sign-up"}
            className="group inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[14px] font-semibold text-canvas transition-transform active:scale-[0.97]"
          >
            {signedIn ? "Open dashboard" : "Start free"}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
