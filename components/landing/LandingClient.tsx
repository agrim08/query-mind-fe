'use client'

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Database, Zap, Lock, Sparkles, LayoutTemplate, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const HEADING_STYLE = {
  fontFamily: "'Bricolage Grotesque', 'Helvetica Neue', Helvetica, sans-serif",
  fontWeight: 800,
  letterSpacing: "-0.03em",
} as const;

const MONO_STYLE = {
  fontFamily: "'Geist Mono', 'Courier New', monospace",
} as const;

const NAV_LINKS = ["Dashboard", "History", "Connections", "Settings"] as const;
const DOTS = ["#ef4444", "#f59e0b", "#22c55e"] as const;
const TABLE_ROWS = [
  ["2025-09-01", "$48,291"],
  ["2025-10-01", "$52,840"],
  ["2025-11-01", "$61,003"],
] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const fadeScale = {
  initial: { opacity: 0, scale: 0.92 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
};

export default function LandingClient() {
  return (
    <div className="min-h-screen bg-[#080909] text-[#f0f1f2] flex flex-col [--accent:#c8f04d]">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between px-6 md:px-12 bg-[#080909]/80 backdrop-blur-xl border-b border-[#27282b]">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <img src="/logo-horizontal.svg" alt="QueryMind Logo" className="h-6 w-auto" />
        </Link>
        <nav className="flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in" className="text-sm font-medium text-[#8a8d93] hover:text-[#f0f1f2] transition-colors">Sign In</Link>
            <Link href="/sign-up" className="text-sm font-semibold bg-[#f0f1f2] text-[#080909] px-4 py-2 rounded-lg hover:bg-white transition-colors">Get Started</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium text-[#8a8d93] hover:text-[#f0f1f2] transition-colors mr-2">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center w-full overflow-x-hidden">

        {/* ── Hero ── */}
        <section className="relative w-full flex flex-col items-center justify-center pt-24 pb-32 px-6 text-center overflow-hidden">
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#27282b 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              opacity: 0.4,
            }}
          />
          {/* Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at top, rgba(200,240,77,0.12) 0%, transparent 70%)",
            }}
          />

          {/* Badge */}
          <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8"
            style={{ background: "rgba(200,240,77,0.08)", borderColor: "rgba(200,240,77,0.25)" }}>
            <span className="w-2 h-2 rounded-full bg-[#c8f04d] animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest text-[#c8f04d]" style={MONO_STYLE}>
              Powered by Gemini 2.5 Flash
            </span>
          </div>

          {/* Headline */}
          <h2
            className="relative max-w-4xl mb-6 text-5xl md:text-7xl lg:text-8xl"
            style={HEADING_STYLE}
          >
            Query your database<br />
            <span className="text-[#c8f04d]">in plain English.</span>
          </h2>

          {/* Subheadline */}
          <p className="relative text-lg md:text-xl text-[#8a8d93] max-w-2xl leading-relaxed mb-10">
            Connect your database. Ask your question. Get the answer.{" "}
            <br className="hidden md:block" />
            No SQL. No developer. No waiting.
          </p>

          {/* CTAs */}
          <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-20 z-10">
            <SignedOut>
              <Link
                href="/sign-up"
                className="flex items-center gap-2 px-8 py-4 bg-[#c8f04d] text-[#080909] rounded-xl font-semibold text-base hover:scale-105 active:scale-95 transition-transform shadow-[0_0_32px_rgba(200,240,77,0.25)]"
              >
                Start for free <ArrowRight size={18} />
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 bg-[#141516] border border-[#27282b] text-[#f0f1f2] rounded-xl font-medium text-base hover:bg-[#1a1b1d] transition-colors"
              >
                See how it works
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-8 py-4 bg-[#c8f04d] text-[#080909] rounded-xl font-semibold text-base hover:scale-105 active:scale-95 transition-transform"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            </SignedIn>
          </div>

          {/* Terminal Mockup */}
          <div className="relative w-full max-w-4xl bg-[#0d1117] border border-[#27282b] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] text-left">
            {/* Title bar */}
            <div className="bg-[#141516] border-b border-[#27282b] px-4 py-3 flex items-center gap-2">
              {DOTS.map((c) => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
              <span className="ml-3 text-xs text-[#8a8d93]" style={MONO_STYLE}>querymind — nl-to-sql</span>
            </div>
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden sm:block w-48 border-r border-[#27282b] bg-[#0e0f10] py-4 shrink-0">
                {NAV_LINKS.map((item, i) => (
                  <div
                    key={item}
                    className={`px-4 py-2 text-sm ${
                      i === 0
                        ? "text-[#c8f04d] bg-[rgba(200,240,77,0.06)] border-l-2 border-[#c8f04d] font-medium"
                        : "text-[#8a8d93] border-l-2 border-transparent"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 p-6 min-w-0">
                <div className="bg-[#141516] border border-[#27282b] rounded-lg px-4 py-3 mb-4 text-sm text-[#f0f1f2]">
                  Show me monthly revenue for the last 3 months
                  <span className="inline-block w-[2px] h-[14px] bg-[#c8f04d] ml-1 align-text-bottom animate-pulse" />
                </div>
                <div className="bg-[#080909] border border-[#27282b] rounded-lg p-4 text-xs leading-loose text-[#8a8d93] mb-4 overflow-x-auto" style={MONO_STYLE}>
                  <span className="text-[#c8f04d]">SELECT </span>
                  <span className="text-[#60a5fa]">DATE_TRUNC</span>
                  (<span className="text-[#34d399]">'month'</span>, <span className="text-[#f0f1f2]">created_at</span>)
                  <span className="text-[#c8f04d]"> AS </span>
                  <span className="text-[#f0f1f2]">month</span>,<br />
                  <span className="pl-4">
                    <span className="text-[#60a5fa]">SUM</span>(<span className="text-[#f0f1f2]">total_amount</span>)
                    <span className="text-[#c8f04d]"> AS </span>
                    <span className="text-[#f0f1f2]">revenue</span>
                  </span><br />
                  <span className="text-[#c8f04d]">FROM </span><span className="text-[#fbbf24]">orders</span><br />
                  <span className="text-[#c8f04d]">WHERE </span>
                  <span className="text-[#f0f1f2]">created_at </span>
                  &gt;= <span className="text-[#60a5fa]">NOW</span>()
                  <span className="text-[#c8f04d]"> - INTERVAL </span>
                  <span className="text-[#34d399]">'3 months'</span><br />
                  <span className="text-[#c8f04d]">GROUP BY </span><span className="text-[#f0f1f2]">month </span>
                  <span className="text-[#c8f04d]">ORDER BY </span><span className="text-[#f0f1f2]">month </span>
                  <span className="text-[#c8f04d]">ASC</span>;
                </div>
                <div className="border border-[#27282b] rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 bg-[#141516] border-b border-[#27282b] px-4 py-2 text-[10px] uppercase tracking-wider text-[#8a8d93]">
                    <div>month</div><div>revenue</div>
                  </div>
                  {TABLE_ROWS.map(([m, r]) => (
                    <div key={m} className="grid grid-cols-2 border-b border-[#27282b] last:border-0 px-4 py-2 text-xs">
                      <div className="text-[#8a8d93]">{m}</div>
                      <div className="text-[#34d399] font-medium">{r}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Logo Cloud ── */}
        <section className="w-full py-10 border-y border-[#1e1f21] bg-[#0e0f10] text-center">
          <p className="text-xs font-semibold text-[#4d5057] uppercase tracking-widest mb-8">
            Designed for modern data-driven teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale px-6">
            {[
              ["●", "Acme Corp"],
              ["◆", "DataFlow"],
              ["○", "Nexus"],
              ["◼", "Vanguard"],
            ].map(([icon, name]) => (
              <div key={name} className="flex items-center gap-2 text-lg font-bold" style={HEADING_STYLE}>
                <span>{icon}</span>{name}
              </div>
            ))}
          </div>
        </section>

        {/* ── Bento Features ── */}
        <section id="features" className="w-full max-w-6xl mx-auto py-28 px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4" style={HEADING_STYLE}>
              Everything you need to move fast.
            </h2>
            <p className="text-[#8a8d93] text-lg max-w-2xl mx-auto leading-relaxed">
              QueryMind combines vector search with Gemini 2.5 Flash to ensure your answers are fast, accurate, and secure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large — Streaming SQL */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 bg-[#0e0f10] border border-[#27282b] rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-[#3a3b3f] transition-colors"
            >
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#c8f04d] rounded-full blur-[130px] opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" />
              <Zap className="text-[#c8f04d] mb-6" size={32} />
              <h3 className="text-2xl md:text-3xl mb-3" style={HEADING_STYLE}>Streaming SQL Generation</h3>
              <p className="text-[#8a8d93] leading-relaxed max-w-md">
                Watch your SQL generate token-by-token in real time. We execute the query only when the syntax is perfect — zero errors, instant results.
              </p>
            </motion.div>

            {/* Small — Security */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#0e0f10] border border-[#27282b] rounded-3xl p-8 md:p-10 hover:border-[#3a3b3f] transition-colors"
            >
              <Lock className="text-[#c8f04d] mb-6" size={32} />
              <h3 className="text-xl md:text-2xl mb-3" style={HEADING_STYLE}>Bank-Grade Security</h3>
              <p className="text-[#8a8d93] text-sm leading-relaxed">
                Connection strings are encrypted with AES-256. Destructive queries (DROP, DELETE) are automatically blocked.
              </p>
            </motion.div>

            {/* Small — Schema Designer */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-[#0e0f10] border border-[#27282b] rounded-3xl p-8 md:p-10 hover:border-[#3a3b3f] transition-colors"
            >
              <LayoutTemplate className="text-[#c8f04d] mb-6" size={32} />
              <h3 className="text-xl md:text-2xl mb-3" style={HEADING_STYLE}>AI Schema Designer</h3>
              <p className="text-[#8a8d93] text-sm leading-relaxed">
                Describe your database in English and we will generate the complete ER diagram and SQL schema instantly.
              </p>
            </motion.div>

            {/* Large — Vector Search */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="md:col-span-2 bg-[#0e0f10] border border-[#27282b] rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-[#3a3b3f] transition-colors"
            >
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#60a5fa] rounded-full blur-[130px] opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" />
              <Sparkles className="text-[#c8f04d] mb-6" size={32} />
              <h3 className="text-2xl md:text-3xl mb-3" style={HEADING_STYLE}>Context-Aware Vector Search</h3>
              <p className="text-[#8a8d93] leading-relaxed max-w-md">
                We index your schema into Pinecone. When you ask a question, we pull only the exact tables and columns needed — completely eliminating AI hallucinations.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="w-full bg-[#0e0f10] border-y border-[#1e1f21] py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4" style={HEADING_STYLE}>How it works</h2>
              <p className="text-[#8a8d93] text-lg max-w-xl mx-auto">From setup to your first insight in under two minutes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[#27282b] to-transparent" />

              {[
                { icon: <Database size={32} className="text-[#f0f1f2]" />, step: "1. Connect Postgres", desc: "Provide a read-only connection string. We map your schema without touching your data." },
                { icon: <Sparkles size={32} className="text-[#c8f04d]" />, step: "2. Ask your question", desc: "Type what you want to know in plain English. We write the optimized SQL." },
                { icon: <CheckCircle2 size={32} className="text-[#34d399]" />, step: "3. Get the answer", desc: "See the query execute and review your results instantly. Export or save for later." },
              ].map(({ icon, step, desc }, i) => (
                <motion.div
                  key={step}
                  {...fadeScale}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-[#141516] border border-[#27282b] flex items-center justify-center mb-6 shadow-xl">
                    {icon}
                  </div>
                  <h3 className="text-xl md:text-2xl mb-2" style={HEADING_STYLE}>{step}</h3>
                  <p className="text-[#8a8d93] text-sm leading-relaxed max-w-[220px]">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="w-full py-32 px-6 relative overflow-hidden text-center">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#c8f04d] blur-[160px] opacity-[0.05] pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6" style={HEADING_STYLE}>
              Ready to stop waiting?
            </h2>
            <p className="text-xl text-[#8a8d93] mb-10 leading-relaxed">
              Join the data teams empowering everyone to get their own answers.
            </p>
            <SignedOut>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-10 py-5 bg-[#c8f04d] text-[#080909] rounded-xl font-bold text-lg hover:bg-[#d4f566] transition-colors shadow-[0_0_40px_rgba(200,240,77,0.3)]"
              >
                Start querying for free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-10 py-5 bg-[#c8f04d] text-[#080909] rounded-xl font-bold text-lg hover:bg-[#d4f566] transition-colors shadow-[0_0_40px_rgba(200,240,77,0.3)]"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-10 px-6 md:px-12 border-t border-[#1e1f21] bg-[#0e0f10] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src="/logo-horizontal.svg" alt="QueryMind" className="h-5 w-auto opacity-80" />
          <span className="text-sm text-[#4d5057]">© {new Date().getFullYear()} QueryMind. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-[#8a8d93]">
          <Link href="#" className="hover:text-[#f0f1f2] transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#f0f1f2] transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-[#f0f1f2] transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
