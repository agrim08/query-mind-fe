'use client'

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Database, Zap, Lock, Sparkles, LayoutTemplate, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, Variants } from "framer-motion";

const HEADING: React.CSSProperties = {
  fontFamily: "'Bricolage Grotesque', 'Helvetica Neue', Helvetica, sans-serif",
  fontWeight: 800,
  letterSpacing: "-0.03em",
};

const MONO: React.CSSProperties = {
  fontFamily: "'Geist Mono', 'Courier New', monospace",
};

const NAV_LINKS = ["Dashboard", "History", "Connections", "Settings"] as const;
const DOTS = ["#ef4444", "#f59e0b", "#22c55e"] as const;
const TABLE_ROWS = [
  ["2025-09-01", "$48,291"],
  ["2025-10-01", "$52,840"],
  ["2025-11-01", "$61,003"],
] as const;

/* Staggered container + item variants — animate immediately on mount */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const scaleItem: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function LandingClient() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#080909", color: "#f0f1f2" }}>

      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 flex h-16 items-center justify-between px-6 md:px-12 border-b"
        style={{ background: "rgba(8,9,9,0.8)", backdropFilter: "blur(20px)", borderColor: "#27282b" }}
      >
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src="/logo-horizontal.svg" alt="QueryMind Logo" style={{ height: 24, width: "auto" }} />
        </Link>
        <nav className="flex items-center gap-4">
          <SignedOut>
            <Link href="/sign-in" style={{ fontSize: 14, fontWeight: 500, color: "#8a8d93" }}
              className="hover:text-[#f0f1f2] transition-colors">Sign In</Link>
            <Link href="/sign-up"
              className="hover:opacity-90 transition-opacity"
              style={{ fontSize: 14, fontWeight: 600, background: "#f0f1f2", color: "#080909", padding: "8px 16px", borderRadius: 8 }}>
              Get Started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" style={{ fontSize: 14, fontWeight: 500, color: "#8a8d93", marginRight: 8 }}
              className="hover:text-[#f0f1f2] transition-colors">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center w-full overflow-x-hidden">

        {/* ── Hero ── */}
        <section
          className="relative w-full flex flex-col items-center justify-center text-center overflow-hidden"
          style={{ paddingTop: 96, paddingBottom: 128, paddingLeft: 24, paddingRight: 24 }}
        >
          {/* Square grid bg */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(39, 40, 43, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(39, 40, 43, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />
          {/* Lime glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{
            width: 900, height: 600,
            background: "radial-gradient(ellipse at top, rgba(200,240,77,0.12) 0%, transparent 70%)",
          }} />

          {/* Badge */}
          <div className="relative inline-flex items-center gap-2 mb-14" style={{
            padding: "6px 16px", borderRadius: 9999,
            marginBottom: "24px",
            background: "rgba(200,240,77,0.08)", border: "1px solid rgba(200,240,77,0.25)",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#c8f04d", display: "inline-block" }} className="animate-pulse" />
            <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c8f04d" }}>
              Powered by Gemini 2.5 Flash
            </span>
          </div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative max-w-4xl mb-6"
            style={{ ...HEADING, fontSize: "clamp(36px, 8vw, 72px)", lineHeight: 1.04 }}
          >
            Query your database<br />
            <span style={{ color: "#c8f04d" }}>in plain English.</span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative max-w-2xl mb-10"
            style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "#8a8d93", lineHeight: 1.65 }}
          >
            Connect your database. Ask your question. Get the answer.{" "}
            No SQL. No developer. No waiting.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex flex-col sm:flex-row items-center gap-4 mb-20"
            style={{ zIndex: 10 }}
          >
            <SignedOut>
              <Link href="/sign-up"
                className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
                style={{
                  padding: "16px 32px", background: "#c8f04d", color: "#080909",
                  borderRadius: 12, fontWeight: 600, fontSize: 16,
                  boxShadow: "0 0 32px rgba(200,240,77,0.25)",
                }}>
                Start for free <ArrowRight size={18} />
              </Link>
              <Link href="#how-it-works"
                className="hover:opacity-90 transition-opacity"
                style={{
                  padding: "16px 32px", background: "#141516", color: "#f0f1f2",
                  border: "1px solid #27282b", borderRadius: 12, fontWeight: 500, fontSize: 16,
                }}>
                See how it works
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard"
                className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform mt-5"
                style={{
                  padding: "14px 24px", background: "#c8f04d", color: "#080909",
                  borderRadius: 8, fontWeight: 600, fontSize: 16, margin: "2rem"
                }}>
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            </SignedIn>
          </motion.div>

          {/* Terminal Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-4xl text-left"
            style={{
              background: "#0d1117", border: "1px solid #27282b",
              borderRadius: 16, overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Title bar */}
            <div className="flex items-center gap-2" style={{
              background: "#141516", borderBottom: "1px solid #27282b", padding: "12px 16px",
            }}>
              {DOTS.map((c) => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
              ))}
              <span className="ml-3" style={{ ...MONO, fontSize: 12, color: "#8a8d93" }}>querymind — nl-to-sql</span>
            </div>
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden sm:block" style={{ width: 192, flexShrink: 0, borderRight: "1px solid #27282b", background: "#0e0f10", paddingTop: 16, paddingBottom: 16 }}>
                {NAV_LINKS.map((item, i) => (
                  <div key={item} style={{
                    padding: "8px 16px", fontSize: 14,
                    color: i === 0 ? "#c8f04d" : "#8a8d93",
                    background: i === 0 ? "rgba(200,240,77,0.06)" : "transparent",
                    borderLeft: i === 0 ? "2px solid #c8f04d" : "2px solid transparent",
                    fontWeight: i === 0 ? 500 : 400,
                  }}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0" style={{ padding: 24 }}>
                <div style={{
                  background: "#141516", border: "1px solid #27282b",
                  borderRadius: 8, padding: "12px 16px", marginBottom: 16,
                  fontSize: 14, color: "#f0f1f2",
                }}>
                  Show me monthly revenue for the last 3 months
                  <span className="inline-block align-text-bottom animate-pulse ml-1" style={{ width: 2, height: 14, background: "#c8f04d" }} />
                </div>
                <div className="overflow-x-auto" style={{
                  background: "#080909", border: "1px solid #27282b",
                  borderRadius: 8, padding: 16, marginBottom: 16,
                  ...MONO, fontSize: 12, lineHeight: 2, color: "#8a8d93",
                }}>
                  <span style={{ color: "#c8f04d" }}>SELECT </span>
                  <span style={{ color: "#60a5fa" }}>DATE_TRUNC</span>
                  (<span style={{ color: "#34d399" }}>'month'</span>, <span style={{ color: "#f0f1f2" }}>created_at</span>)
                  <span style={{ color: "#c8f04d" }}> AS </span>
                  <span style={{ color: "#f0f1f2" }}>month</span>,<br />
                  <span style={{ paddingLeft: 16 }}>
                    <span style={{ color: "#60a5fa" }}>SUM</span>(<span style={{ color: "#f0f1f2" }}>total_amount</span>)
                    <span style={{ color: "#c8f04d" }}> AS </span>
                    <span style={{ color: "#f0f1f2" }}>revenue</span>
                  </span><br />
                  <span style={{ color: "#c8f04d" }}>FROM </span><span style={{ color: "#fbbf24" }}>orders</span><br />
                  <span style={{ color: "#c8f04d" }}>WHERE </span>
                  <span style={{ color: "#f0f1f2" }}>created_at </span>
                  &gt;= <span style={{ color: "#60a5fa" }}>NOW</span>()
                  <span style={{ color: "#c8f04d" }}> - INTERVAL </span>
                  <span style={{ color: "#34d399" }}>'3 months'</span><br />
                  <span style={{ color: "#c8f04d" }}>GROUP BY </span><span style={{ color: "#f0f1f2" }}>month </span>
                  <span style={{ color: "#c8f04d" }}>ORDER BY </span><span style={{ color: "#f0f1f2" }}>month </span>
                  <span style={{ color: "#c8f04d" }}>ASC</span>;
                </div>
                <div style={{ border: "1px solid #27282b", borderRadius: 8, overflow: "hidden" }}>
                  <div className="grid grid-cols-2" style={{
                    background: "#141516", borderBottom: "1px solid #27282b",
                    padding: "8px 16px", fontSize: 10,
                    textTransform: "uppercase", letterSpacing: "0.1em", color: "#8a8d93",
                  }}>
                    <div>month</div><div>revenue</div>
                  </div>
                  {TABLE_ROWS.map(([m, r]) => (
                    <div key={m} className="grid grid-cols-2" style={{
                      borderBottom: "1px solid #27282b", padding: "8px 16px", fontSize: 12,
                    }}>
                      <div style={{ color: "#8a8d93" }}>{m}</div>
                      <div style={{ color: "#34d399", fontWeight: 500 }}>{r}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Logo Cloud ── */}
        <section className="w-full text-center" style={{
          padding: "40px 24px", borderTop: "1px solid #1e1f21", borderBottom: "1px solid #1e1f21",
          background: "#0e0f10",
        }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#4d5057", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 32 }}>
            Designed for modern data-driven teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20" style={{ opacity: 0.4, filter: "grayscale(1)" }}>
            {[["●", "Acme Corp"], ["◆", "DataFlow"], ["○", "Nexus"], ["◼", "Vanguard"]].map(([icon, name]) => (
              <div key={name} className="flex items-center gap-2" style={{ ...HEADING, fontSize: 18 }}>
                <span>{icon}</span>{name}
              </div>
            ))}
          </div>
        </section>

        {/* ── Bento Features ── */}
        <section id="features" className="w-full relative overflow-hidden" style={{ maxWidth: 1200, margin: "0 auto", padding: "112px 24px" }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(39, 40, 43, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(39, 40, 43, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />
          <div className="text-center" style={{ marginBottom: 64 }}>
            <h2 style={{ ...HEADING, fontSize: "clamp(32px, 5vw, 60px)", marginBottom: 16 }}>
              Everything you need to move fast.
            </h2>
            <p style={{ color: "#8a8d93", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.65 }}>
              QueryMind combines vector search with Gemini 2.5 Flash to ensure your answers are fast, accurate, and secure.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Large — Streaming SQL */}
            <motion.div variants={item} className="md:col-span-2 relative overflow-hidden group" style={{
              background: "#0e0f10", border: "1px solid #27282b", borderRadius: 24, padding: 48,
            }}>
              <div className="absolute top-0 right-0 pointer-events-none" style={{
                width: 280, height: 280, borderRadius: "50%", background: "#c8f04d",
                filter: "blur(120px)", opacity: 0.05,
              }} />
              <Zap style={{ color: "#c8f04d", marginBottom: 24 }} size={32} />
              <h3 style={{ ...HEADING, fontSize: "clamp(20px, 2.5vw, 28px)", marginBottom: 12 }}>Streaming SQL Generation</h3>
              <p style={{ color: "#8a8d93", lineHeight: 1.7, maxWidth: 420 }}>
                Watch your SQL generate token-by-token in real time. We execute the query only when the syntax is perfect — zero errors, instant results.
              </p>
            </motion.div>

            {/* Small — Security */}
            <motion.div variants={item} style={{
              background: "#0e0f10", border: "1px solid #27282b", borderRadius: 24, padding: 40,
            }}>
              <Lock style={{ color: "#c8f04d", marginBottom: 24 }} size={32} />
              <h3 style={{ ...HEADING, fontSize: "clamp(18px, 2vw, 22px)", marginBottom: 12 }}>Bank-Grade Security</h3>
              <p style={{ color: "#8a8d93", fontSize: 14, lineHeight: 1.7 }}>
                Connection strings are encrypted with AES-256. Destructive queries (DROP, DELETE) are automatically blocked.
              </p>
            </motion.div>

            {/* Small — Schema Designer */}
            <motion.div variants={item} style={{
              background: "#0e0f10", border: "1px solid #27282b", borderRadius: 24, padding: 40,
            }}>
              <LayoutTemplate style={{ color: "#c8f04d", marginBottom: 24 }} size={32} />
              <h3 style={{ ...HEADING, fontSize: "clamp(18px, 2vw, 22px)", marginBottom: 12 }}>AI Schema Designer</h3>
              <p style={{ color: "#8a8d93", fontSize: 14, lineHeight: 1.7 }}>
                Describe your database in English and we generate the complete ER diagram and SQL schema instantly.
              </p>
            </motion.div>

            {/* Large — Vector Search */}
            <motion.div variants={item} className="md:col-span-2 relative overflow-hidden group" style={{
              background: "#0e0f10", border: "1px solid #27282b", borderRadius: 24, padding: 48,
            }}>
              <div className="absolute bottom-0 right-0 pointer-events-none" style={{
                width: 280, height: 280, borderRadius: "50%", background: "#60a5fa",
                filter: "blur(120px)", opacity: 0.05,
              }} />
              <Sparkles style={{ color: "#c8f04d", marginBottom: 24 }} size={32} />
              <h3 style={{ ...HEADING, fontSize: "clamp(20px, 2.5vw, 28px)", marginBottom: 12 }}>Context-Aware Vector Search</h3>
              <p style={{ color: "#8a8d93", lineHeight: 1.7, maxWidth: 420 }}>
                We index your schema into Pinecone. When you ask a question, we pull only the exact tables and columns needed — completely eliminating AI hallucinations.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="w-full relative overflow-hidden" style={{
          background: "#0e0f10", borderTop: "1px solid #1e1f21", borderBottom: "1px solid #1e1f21",
          padding: "112px 24px",
        }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(39, 40, 43, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(39, 40, 43, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="text-center" style={{ marginBottom: 64 }}>
              <h2 style={{ ...HEADING, fontSize: "clamp(32px, 5vw, 60px)", marginBottom: 16 }}>How it works</h2>
              <p style={{ color: "#8a8d93", fontSize: 18, maxWidth: 480, margin: "0 auto" }}>
                From setup to your first insight in under two minutes.
              </p>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {/* Connector line */}
              <div className="hidden md:block absolute" style={{
                top: 48, left: "16%", right: "16%", height: 1,
                background: "linear-gradient(to right, transparent, #27282b, transparent)",
              }} />

              {[
                { icon: <Database size={32} style={{ color: "#f0f1f2" }} />, step: "1. Connect Postgres", desc: "Provide a read-only connection string. We map your schema without touching your data." },
                { icon: <Sparkles size={32} style={{ color: "#c8f04d" }} />, step: "2. Ask your question", desc: "Type what you want to know in plain English. We write the optimized SQL." },
                { icon: <CheckCircle2 size={32} style={{ color: "#34d399" }} />, step: "3. Get the answer", desc: "See the query execute and review your results instantly. Export or save for later." },
              ].map(({ icon, step, desc }) => (
                <motion.div
                  key={step}
                  variants={scaleItem}
                  className="relative flex flex-col items-center text-center"
                  style={{ zIndex: 10 }}
                >
                  <div className="flex items-center justify-center" style={{
                    width: 96, height: 96, borderRadius: "50%",
                    background: "#141516", border: "1px solid #27282b",
                    marginBottom: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}>
                    {icon}
                  </div>
                  <h3 style={{ ...HEADING, fontSize: "clamp(16px, 2vw, 20px)", marginBottom: 8 }}>{step}</h3>
                  <p style={{ color: "#8a8d93", fontSize: 14, lineHeight: 1.7, maxWidth: 220 }}>{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="w-full text-center relative overflow-hidden" style={{ padding: "128px 24px" }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(39, 40, 43, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(39, 40, 43, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }} />
          <div className="absolute pointer-events-none" style={{
            bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: 800, height: 400, borderRadius: "50%", background: "#c8f04d",
            filter: "blur(160px)", opacity: 0.05,
          }} />
          <div className="relative" style={{ maxWidth: 720, margin: "0 auto", zIndex: 10 }}>
            <h2 style={{ ...HEADING, fontSize: "clamp(36px, 6vw, 72px)", marginBottom: 24 }}>
              Ready to stop waiting?
            </h2>
            <p style={{ fontSize: 20, color: "#8a8d93", marginBottom: 40, lineHeight: 1.65 }}>
              Join the data teams empowering everyone to get their own answers.
            </p>
            <SignedOut>
              <Link href="/sign-up" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                style={{
                  padding: "20px 40px", background: "#c8f04d", color: "#080909",
                  borderRadius: 12, fontWeight: 700, fontSize: 18,
                  boxShadow: "0 0 40px rgba(200,240,77,0.3)",
                }}>
                Start querying for free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                style={{
                  padding: "12px 20px", background: "#c8f04d", color: "#080909",
                  borderRadius: 12, fontWeight: 700, fontSize: 18,
                  boxShadow: "0 0 40px rgba(200,240,77,0.3)",
                }}>
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            </SignedIn>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="w-full flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ padding: "40px 48px", borderTop: "1px solid #1e1f21", background: "#0e0f10" }}
      >
        <div className="flex items-center gap-4">
          <img src="/logo-horizontal.svg" alt="QueryMind" style={{ height: 20, width: "auto", opacity: 0.8 }} />
          <span style={{ fontSize: 13, color: "#4d5057" }}>© {new Date().getFullYear()} QueryMind. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6" style={{ fontSize: 13, color: "#8a8d93" }}>
          <Link href="#" className="hover:text-[#f0f1f2] transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-[#f0f1f2] transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-[#f0f1f2] transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
