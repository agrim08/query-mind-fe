'use client'

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowRight, Database, Zap, Lock, Sparkles, LayoutTemplate, CheckCircle2, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";

/* ─── Design tokens ─── */
const BG       = "#080909";
const SURFACE  = "#0e0f10";
const ELEVATED = "#141516";
const BORDER   = "#27282b";
const ACCENT   = "#c8f04d";
const TEXT1    = "#f0f1f2";
const TEXT2    = "#8a8d93";
const TEXT3    = "#4d5057";
const SUCCESS  = "#34d399";
const INFO     = "#60a5fa";

const HEADING: React.CSSProperties = {
  fontFamily: "'Bricolage Grotesque', 'Helvetica Neue', sans-serif",
  fontWeight: 800,
  letterSpacing: "-0.04em",
};
const MONO: React.CSSProperties = {
  fontFamily: "'Geist Mono', 'Courier New', monospace",
};

/* ─── Animation variants ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

/* ─── Grid background ─── */
const GridBg = ({ opacity = 0.35 }: { opacity?: number }) => (
  <div className="absolute inset-0 pointer-events-none" style={{
    backgroundImage: `
      linear-gradient(to right, rgba(39,40,43,${opacity}) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(39,40,43,${opacity}) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
  }} />
);

/* ─── Section label chip ─── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 mb-6" style={{
    padding: "5px 14px", borderRadius: 9999,
    background: "rgba(200,240,77,0.07)",
    border: `1px solid rgba(200,240,77,0.2)`,
  }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
    <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: ACCENT }}>
      {children}
    </span>
  </div>
);

/* ─── Marquee of logos ─── */
const LOGOS = [
  "Postgres", "Neon", "Supabase", "PlanetScale", "CockroachDB",
  "Aiven", "Railway", "Render", "Fly.io", "Vercel",
];
const Marquee = () => {
  const items = [...LOGOS, ...LOGOS];
  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 120, zIndex: 2,
        background: `linear-gradient(to right, ${SURFACE}, transparent)`,
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 120, zIndex: 2,
        background: `linear-gradient(to left, ${SURFACE}, transparent)`,
      }} />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", gap: 48, whiteSpace: "nowrap", width: "max-content" }}
      >
        {items.map((name, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 20px",
            background: ELEVATED, border: `1px solid ${BORDER}`,
            borderRadius: 8, flexShrink: 0,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: TEXT3 }} />
            <span style={{ ...MONO, fontSize: 12, color: TEXT2, letterSpacing: "0.03em" }}>{name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

/* ─── Animated SQL typewriter ─── */
const SQL_QUERIES = [
  {
    nl: "Show me monthly revenue for the last 3 months",
    sql: `SELECT DATE_TRUNC('month', created_at) AS month,
       SUM(total_amount) AS revenue
FROM orders
WHERE created_at >= NOW() - INTERVAL '3 months'
GROUP BY month ORDER BY month ASC;`,
    rows: [["2025-09-01", "$48,291"], ["2025-10-01", "$52,840"], ["2025-11-01", "$61,003"]],
    cols: ["month", "revenue"],
  },
  {
    nl: "Which products have never been sold?",
    sql: `SELECT p.id, p.name, p.sku
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE oi.id IS NULL
ORDER BY p.name ASC;`,
    rows: [["prod_028", "Legacy Widget", "LW-028"], ["prod_091", "Archive Kit", "AK-091"]],
    cols: ["id", "name", "sku"],
  },
  {
    nl: "Top 10 customers by total spend",
    sql: `SELECT c.name, c.email,
       SUM(o.total_amount) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id
ORDER BY total_spent DESC
LIMIT 10;`,
    rows: [["Acme Corp", "acme@corp.io", "$142,800"], ["TechFlow", "hello@tf.dev", "$98,420"]],
    cols: ["name", "email", "total_spent"],
  },
];

const DOTS = ["#ef4444", "#f59e0b", "#22c55e"] as const;

const DemoTerminal = () => {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"typing" | "result" | "fading">("typing");
  const [sqlVisible, setSqlVisible] = useState("");
  const current = SQL_QUERIES[idx];

  useEffect(() => {
    setPhase("typing");
    setSqlVisible("");
    let i = 0;
    const full = current.sql;
    const timer = setInterval(() => {
      i++;
      setSqlVisible(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer);
        setTimeout(() => setPhase("result"), 200);
        setTimeout(() => setPhase("fading"), 3800);
        setTimeout(() => {
          setIdx(prev => (prev + 1) % SQL_QUERIES.length);
        }, 4600);
      }
    }, 18);
    return () => clearInterval(timer);
  }, [idx]);

  const colorSQL = (s: string) =>
    s
      .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|GROUP BY|ORDER BY|LIMIT|AS|ON|AND|OR|DESC|ASC|INTERVAL|NOT|NULL)\b/g,
        '<span style="color:#c8f04d">$1</span>')
      .replace(/\b(DATE_TRUNC|SUM|COUNT|AVG|MAX|MIN|NOW)\b/g,
        '<span style="color:#60a5fa">$1</span>')
      .replace(/'([^']*)'/g, '<span style="color:#34d399">\'$1\'</span>');

  return (
    <div style={{
      background: "#0d1117", border: `1px solid ${BORDER}`,
      borderRadius: 16, overflow: "hidden",
      boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,240,77,0.04)",
    }}>
      {/* Title bar */}
      <div style={{
        background: ELEVATED, borderBottom: `1px solid ${BORDER}`,
        padding: "11px 16px", display: "flex", alignItems: "center", gap: 8,
      }}>
        {DOTS.map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
        <span style={{ ...MONO, fontSize: 12, color: TEXT3, marginLeft: 8 }}>querymind — query workspace</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {SQL_QUERIES.map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: i === idx ? ACCENT : TEXT3,
              transition: "background 0.3s",
              cursor: "pointer",
            }} onClick={() => setIdx(i)} />
          ))}
        </div>
      </div>

      <div style={{ display: "flex" }}>
        {/* Sidebar strip */}
        <div style={{
          width: 180, flexShrink: 0, borderRight: `1px solid ${BORDER}`,
          background: "#0a0b0c", padding: "16px 0",
        }}>
          {["Dashboard", "History", "Connections", "Schema"].map((item, i) => (
            <div key={item} style={{
              padding: "8px 16px", fontSize: 13, color: i === 0 ? ACCENT : TEXT2,
              background: i === 0 ? "rgba(200,240,77,0.06)" : "transparent",
              borderLeft: `2px solid ${i === 0 ? ACCENT : "transparent"}`,
              fontWeight: i === 0 ? 500 : 400,
            }}>{item}</div>
          ))}
        </div>

        {/* Main area */}
        <div style={{ flex: 1, padding: 20, minWidth: 0 }}>
          {/* NL input */}
          <AnimatePresence mode="wait">
            <motion.div
              key={idx + "-nl"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: ELEVATED, border: `1px solid ${ACCENT}`,
                boxShadow: `0 0 0 3px rgba(200,240,77,0.08)`,
                borderRadius: 8, padding: "10px 14px",
                marginBottom: 14, fontSize: 13, color: TEXT1,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}
            >
              <span>{current.nl}</span>
              <span style={{ ...MONO, fontSize: 10, color: TEXT3 }}>⌘↵</span>
            </motion.div>
          </AnimatePresence>

          {/* SQL output */}
          <div style={{
            background: "#080909", border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: "14px 16px", marginBottom: 14,
            ...MONO, fontSize: 12, lineHeight: 1.85,
            minHeight: 120, position: "relative",
            transition: "opacity 0.4s",
            opacity: phase === "fading" ? 0 : 1,
          }}>
            <div dangerouslySetInnerHTML={{ __html: colorSQL(sqlVisible) }} />
            {phase === "typing" && (
              <span style={{
                display: "inline-block", width: 2, height: 14,
                background: ACCENT, verticalAlign: "text-bottom",
                marginLeft: 1,
                animation: "blink 1s step-end infinite",
              }} />
            )}
          </div>

          {/* Results */}
          <AnimatePresence>
            {phase === "result" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}
              >
                <div style={{
                  display: "grid", gridTemplateColumns: `repeat(${current.cols.length}, 1fr)`,
                  background: ELEVATED, borderBottom: `1px solid ${BORDER}`,
                  padding: "7px 14px",
                }}>
                  {current.cols.map(c => (
                    <div key={c} style={{ ...MONO, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: TEXT3 }}>{c}</div>
                  ))}
                </div>
                {current.rows.map((row, r) => (
                  <div key={r} style={{
                    display: "grid", gridTemplateColumns: `repeat(${current.cols.length}, 1fr)`,
                    padding: "8px 14px", borderBottom: r < current.rows.length - 1 ? `1px solid ${BORDER}` : "none",
                  }}>
                    {row.map((cell, c) => (
                      <div key={c} style={{
                        fontSize: 12, color: c === row.length - 1 ? SUCCESS : TEXT2,
                        ...MONO, fontWeight: c === row.length - 1 ? 500 : 400,
                      }}>{cell}</div>
                    ))}
                  </div>
                ))}
                <div style={{
                  padding: "7px 14px", background: ELEVATED,
                  borderTop: `1px solid ${BORDER}`,
                  display: "flex", gap: 12, alignItems: "center",
                }}>
                  <span style={{ ...MONO, fontSize: 10, color: SUCCESS }}>✓ {current.rows.length} rows</span>
                  <span style={{ ...MONO, fontSize: 10, color: TEXT3 }}>·</span>
                  <span style={{ ...MONO, fontSize: 10, color: TEXT3 }}>~{Math.floor(Math.random() * 200 + 80)}ms</span>
                  <span style={{ ...MONO, fontSize: 10, color: TEXT3 }}>·</span>
                  <span style={{ ...MONO, fontSize: 10, color: TEXT3 }}>read-only ✓</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
};

/* ─── Feature rows (Linear-style) ─── */
const FEATURES = [
  {
    label: "Streaming Generation",
    icon: <Zap size={20} style={{ color: ACCENT }} />,
    title: "SQL that writes itself, live.",
    desc: "Watch your query generate token by token using Gemini 2.5 Flash. No waiting for a full response — results start arriving before the query finishes streaming.",
    detail: "Server-Sent Events (SSE) pipeline. Validated before execution. Read-only enforced at the connection level.",
  },
  {
    label: "Vector Schema Search",
    icon: <Sparkles size={20} style={{ color: INFO }} />,
    title: "Only the tables that matter.",
    desc: "We embed your entire schema into Pinecone. When you ask a question, we retrieve only the relevant tables — eliminating hallucinated columns and wrong joins.",
    detail: "Gemini text-embedding-004 · Pinecone cosine similarity · top-6 retrieval",
  },
  {
    label: "Schema Designer",
    icon: <LayoutTemplate size={20} style={{ color: "#a78bfa" }} />,
    title: "Describe it. See the diagram.",
    desc: "Type a description of your database in plain English. We generate the complete ER diagram on an interactive canvas, with FK relationships drawn automatically.",
    detail: "React Flow canvas · Export to PDF or SQL file · One prompt, full schema",
  },
  {
    label: "Security First",
    icon: <Lock size={20} style={{ color: SUCCESS }} />,
    title: "Blocked before it reaches your DB.",
    desc: "Every query passes through a validation layer before touching your database. DROP, DELETE, TRUNCATE — all blocked by default. Connection strings are Fernet-encrypted at rest.",
    detail: "AES-256 encryption · keyword blocklist · 10s execution timeout · 500-row cap",
  },
];

const FeatureRow = ({ feature, index }: { feature: typeof FEATURES[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.1, 0.3], [40, 0]);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-12 items-center`}
    >
      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20,
          padding: "5px 12px", borderRadius: 6,
          background: ELEVATED, border: `1px solid ${BORDER}`,
        }}>
          {feature.icon}
          <span style={{ ...MONO, fontSize: 11, color: TEXT2, letterSpacing: "0.05em" }}>{feature.label}</span>
        </div>
        <h3 style={{ ...HEADING, fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 16, lineHeight: 1.15 }}>
          {feature.title}
        </h3>
        <p style={{ fontSize: 16, color: TEXT2, lineHeight: 1.75, marginBottom: 20, maxWidth: 440 }}>
          {feature.desc}
        </p>
        <div style={{
          ...MONO, fontSize: 11, color: TEXT3, letterSpacing: "0.03em",
          padding: "10px 14px", background: ELEVATED, border: `1px solid ${BORDER}`,
          borderRadius: 6, borderLeft: `2px solid ${ACCENT}`,
        }}>
          {feature.detail}
        </div>
      </div>

      {/* Visual card */}
      <div style={{
        flex: 1, background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 20, padding: 32, minHeight: 220,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 180, height: 180,
          borderRadius: "50%", background: ACCENT, filter: "blur(80px)", opacity: 0.04,
        }} />
        <div style={{ ...MONO, fontSize: 12, color: TEXT3, marginBottom: 16, letterSpacing: "0.05em" }}>
          // {feature.label.toLowerCase().replace(/ /g, "_")}.ts
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 10, borderRadius: 4,
              background: `rgba(240,241,242,0.0${i === 1 ? 8 : i === 2 ? 5 : 3})`,
              width: `${[88, 72, 56][i - 1]}%`,
            }} />
          ))}
          <div style={{ height: 24 }} />
          {[1, 2].map(i => (
            <div key={i} style={{
              height: 10, borderRadius: 4,
              background: i === 1 ? `rgba(200,240,77,0.15)` : `rgba(96,165,250,0.1)`,
              width: `${[60, 44][i - 1]}%`,
            }} />
          ))}
        </div>
        <div style={{
          position: "absolute", bottom: 20, right: 20,
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 12px", borderRadius: 6,
          background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)",
        }}>
          <CheckCircle2 size={12} style={{ color: SUCCESS }} />
          <span style={{ ...MONO, fontSize: 10, color: SUCCESS }}>validated</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Stats ─── */
const STATS = [
  { value: "<2s", label: "SQL generated & executed" },
  { value: "100%", label: "Queries validated before run" },
  { value: "0", label: "Hallucinated table names" },
  { value: "∞", label: "Databases supported" },
];

/* ─── Testimonial carousel ─── */
const TESTIMONIALS = [
  {
    quote: "I stopped pinging our backend team for one-off queries. QueryMind just answers them.",
    name: "Priya K.",
    role: "Product Manager",
    co: "Series B SaaS",
  },
  {
    quote: "The schema indexing is genuinely smart. It only pulls the tables that are actually relevant.",
    name: "Marcus L.",
    role: "Staff Engineer",
    co: "Fintech startup",
  },
  {
    quote: "Built our entire data QA workflow around this. The read-only enforcement was a dealbreaker (in the good way).",
    name: "Nadia R.",
    role: "Data Analyst",
    co: "E-commerce scale-up",
  },
  {
    quote: "The streaming output makes it feel instant. I can see the SQL forming before I've finished reading the question.",
    name: "James T.",
    role: "Founding Engineer",
    co: "Developer tools",
  },
];

const TestimonialCarousel = () => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(prev => (prev + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <div style={{ position: "relative", minHeight: 160 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <p style={{
              fontSize: "clamp(16px, 2.2vw, 20px)", color: TEXT1,
              lineHeight: 1.65, marginBottom: 28, fontStyle: "italic",
              maxWidth: 540,
            }}>
              "{TESTIMONIALS[active].quote}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: ELEVATED, border: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                ...HEADING, fontSize: 14, color: ACCENT,
              }}>
                {TESTIMONIALS[active].name[0]}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: TEXT1 }}>{TESTIMONIALS[active].name}</div>
                <div style={{ ...MONO, fontSize: 11, color: TEXT3 }}>
                  {TESTIMONIALS[active].role} · {TESTIMONIALS[active].co}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 170 }}>
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: i === active ? 24 : 6, height: 6, borderRadius: 3,
              background: i === active ? ACCENT : BORDER,
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Main component ─── */
export default function LandingClient() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroBgOpacity = useTransform(heroScroll, [0, 1], [0.12, 0]);
  const heroY = useTransform(heroScroll, [0, 1], [0, 80]);

  return (
    <div style={{ background: BG, color: TEXT1, minHeight: "100vh", fontFamily: "'Geist', sans-serif", overflowX: "hidden" }}>

      {/* ── Navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(8,9,9,0.75)", backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${BORDER}`,
        height: 60, display: "flex", alignItems: "center",
        padding: "0 clamp(20px, 5vw, 48px)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/logo-horizontal.svg" alt="QueryMind" style={{ height: 22, width: "auto" }} />
        </Link>

        {/* Center links */}
        <nav style={{ display: "flex", gap: 4, margin: "0 auto" }}>
          {["Features", "How it works", "Schema Designer"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{
              fontSize: 13, color: TEXT2, textDecoration: "none",
              padding: "6px 12px", borderRadius: 6,
              transition: "color 0.15s, background 0.15s",
            }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = TEXT1; (e.target as HTMLElement).style.background = ELEVATED; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = TEXT2; (e.target as HTMLElement).style.background = "transparent"; }}
            >{l}</a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SignedOut>
            <Link href="/sign-in" style={{
              fontSize: 13, color: TEXT2, textDecoration: "none", padding: "7px 14px",
              borderRadius: 7, border: `1px solid ${BORDER}`, background: ELEVATED,
              fontWeight: 500, transition: "all 0.15s",
            }}>Sign in</Link>
            <Link href="/sign-up" style={{
              fontSize: 13, fontWeight: 600, background: ACCENT, color: BG,
              textDecoration: "none", padding: "7px 16px", borderRadius: 7,
              transition: "opacity 0.15s",
            }}>Get started</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" style={{
              fontSize: 13, fontWeight: 600, background: ACCENT, color: BG,
              textDecoration: "none", padding: "7px 16px", borderRadius: 7,
              display: "flex", alignItems: "center", gap: 6,
            }}>Dashboard <ArrowRight size={13} /></Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main>

        {/* ── Hero ── */}
        <section ref={heroRef} style={{
          position: "relative", overflow: "hidden",
          paddingTop: "clamp(80px, 12vw, 140px)",
          paddingBottom: "clamp(60px, 8vw, 100px)",
          paddingLeft: "clamp(20px, 5vw, 48px)", paddingRight: "clamp(20px, 5vw, 48px)",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        }}>
          <GridBg />

          {/* Glow */}
          <motion.div style={{ opacity: heroBgOpacity }} className="absolute inset-0 pointer-events-none">
            <div style={{
              position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
              width: 900, height: 600,
              background: "radial-gradient(ellipse at top, rgba(200,240,77,0.12) 0%, transparent 68%)",
            }} />
          </motion.div>

          <motion.div
            style={{ y: heroY, position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32,
                padding: "6px 16px", borderRadius: 9999,
                background: "rgba(200,240,77,0.07)", border: "1px solid rgba(200,240,77,0.22)",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, display: "inline-block" }}
                  className="animate-pulse" />
                <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase", color: ACCENT }}>
                  Powered by Gemini 2.5 Flash + Pinecone
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              style={{
                ...HEADING,
                fontSize: "clamp(40px, 9vw, 84px)",
                lineHeight: 1.02, marginBottom: 24,
                maxWidth: 860,
              }}
            >
              Query your database<br />
              <span style={{ color: ACCENT }}>in plain English.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp}
              style={{
                fontSize: "clamp(16px, 2.2vw, 20px)", color: TEXT2,
                lineHeight: 1.7, maxWidth: 520, marginBottom: 40,
              }}
            >
              Connect your database. Ask your question. Get the answer.
              No SQL. No developer. No waiting.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
              <SignedOut>
                <Link href="/sign-up" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "14px 28px", background: ACCENT, color: BG,
                  borderRadius: 10, fontWeight: 700, fontSize: 15,
                  textDecoration: "none",
                  boxShadow: "0 0 40px rgba(200,240,77,0.22)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                >
                  Start querying free <ArrowRight size={16} />
                </Link>
                <Link href="#how-it-works" style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "14px 24px", background: ELEVATED, color: TEXT1,
                  border: `1px solid ${BORDER}`, borderRadius: 10,
                  fontWeight: 500, fontSize: 15, textDecoration: "none",
                  transition: "border-color 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = TEXT3; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
                >
                  See how it works
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "14px 28px", background: ACCENT, color: BG,
                  borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none",
                }}>
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              </SignedIn>
            </motion.div>

            {/* Trust line */}
            <motion.div variants={fadeUp} style={{
              display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", justifyContent: "center",
            }}>
              {["No credit card", "Any Postgres DB", "Results in seconds"].map((t, i) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  {i > 0 && <span style={{ ...MONO, fontSize: 11, color: TEXT3, margin: "0 10px" }}>·</span>}
                  <span style={{ ...MONO, fontSize: 11, color: TEXT3 }}>{t}</span>
                </span>
              ))}
            </motion.div>

            {/* Terminal */}
            <motion.div
              variants={fadeUp}
              style={{ width: "100%", maxWidth: 760, marginTop: 56, textAlign: "left" }}
            >
              <DemoTerminal />
            </motion.div>
          </motion.div>
        </section>

        {/* ── Compatibility marquee ── */}
        <div style={{
          background: SURFACE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
          padding: "28px 0",
        }}>
          <div style={{
            ...MONO, fontSize: 10, color: TEXT3, textAlign: "center",
            letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20,
          }}>
            Works with every Postgres provider
          </div>
          <Marquee />
        </div>

        {/* ── Stats strip ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 1, background: BORDER, borderTop: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          {STATS.map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} style={{
              background: BG, padding: "40px 24px", textAlign: "center",
            }}>
              <div style={{ ...HEADING, fontSize: 40, color: ACCENT, marginBottom: 8 }}>{value}</div>
              <div style={{ ...MONO, fontSize: 11, color: TEXT3, letterSpacing: "0.05em" }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Features (Linear-style rows) ── */}
        <section id="features" style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "clamp(80px, 10vw, 140px) clamp(20px, 5vw, 48px)",
          display: "flex", flexDirection: "column", gap: 120,
          position: "relative",
        }}>
          <div style={{ textAlign: "center" }}>
            <SectionLabel>Features</SectionLabel>
            <h2 style={{ ...HEADING, fontSize: "clamp(28px, 5vw, 54px)", marginBottom: 16 }}>
              Built for the question, not the query.
            </h2>
            <p style={{ fontSize: 17, color: TEXT2, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              Every part of QueryMind is designed around getting you to an answer as fast as possible.
            </p>
          </div>
          {FEATURES.map((f, i) => <FeatureRow key={f.label} feature={f} index={i} />)}
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" style={{
          background: SURFACE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
          position: "relative", overflow: "hidden",
          padding: "clamp(80px, 10vw, 120px) clamp(20px, 5vw, 48px)",
        }}>
          <GridBg opacity={0.18} />
          <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <SectionLabel>How it works</SectionLabel>
              <h2 style={{ ...HEADING, fontSize: "clamp(28px, 5vw, 54px)", marginBottom: 16 }}>
                From question to answer in two minutes.
              </h2>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              style={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {[
                {
                  n: "01", icon: <Database size={18} style={{ color: TEXT2 }} />,
                  title: "Connect your Postgres database",
                  desc: "Paste a read-only connection string. We introspect your schema, embed every table into Pinecone, and never touch your data.",
                  tag: "one-time setup · ~30 seconds",
                },
                {
                  n: "02", icon: <Sparkles size={18} style={{ color: ACCENT }} />,
                  title: "Ask your question",
                  desc: "Type exactly what you want to know. No syntax, no table names, no SQL. We embed your question and retrieve the right schema context.",
                  tag: "natural language → vector search → prompt",
                },
                {
                  n: "03", icon: <Zap size={18} style={{ color: INFO }} />,
                  title: "SQL streams, results follow",
                  desc: "Gemini 2.5 Flash generates your query live. It's validated, executed, and results land in the table — all within seconds.",
                  tag: "SSE streaming · read-only enforced · instant results",
                },
              ].map(({ n, icon, title, desc, tag }, i) => (
                <motion.div key={n} variants={fadeUp} style={{
                  display: "flex", gap: 24, alignItems: "flex-start",
                  padding: "28px 32px",
                  background: ELEVATED, border: `1px solid ${BORDER}`,
                  borderRadius: i === 0 ? "12px 12px 0 0" : i === 2 ? "0 0 12px 12px" : 0,
                  borderBottom: i < 2 ? "none" : `1px solid ${BORDER}`,
                  transition: "background 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1a1b1d"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ELEVATED; }}
                >
                  <div style={{
                    ...MONO, fontSize: 11, color: TEXT3, minWidth: 28, paddingTop: 3,
                  }}>{n}</div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: BG, border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: TEXT1, marginBottom: 6 }}>{title}</div>
                    <div style={{ fontSize: 14, color: TEXT2, lineHeight: 1.65, marginBottom: 10 }}>{desc}</div>
                    <div style={{ ...MONO, fontSize: 10, color: TEXT3, letterSpacing: "0.04em" }}>{tag}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: TEXT3, flexShrink: 0, marginTop: 4 }} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Schema Designer callout ── */}
        <section id="schema-designer" style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "clamp(80px, 10vw, 120px) clamp(20px, 5vw, 48px)",
        }}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            style={{
              background: SURFACE, border: `1px solid ${BORDER}`,
              borderRadius: 24, overflow: "hidden",
              display: "flex", flexWrap: "wrap",
            }}
          >
            {/* Text side */}
            <motion.div variants={fadeUp} style={{ flex: "1 1 320px", padding: "clamp(32px, 5vw, 60px)" }}>
              <SectionLabel>New Feature</SectionLabel>
              <h2 style={{ ...HEADING, fontSize: "clamp(26px, 4vw, 44px)", lineHeight: 1.1, marginBottom: 20 }}>
                Design your database<br />with a prompt.
              </h2>
              <p style={{ fontSize: 16, color: TEXT2, lineHeight: 1.75, marginBottom: 28, maxWidth: 380 }}>
                Describe your data model in plain English. We generate a complete ER diagram on an interactive canvas — with foreign key lines, column types, and a downloadable SQL schema.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                {[
                  "Interactive canvas powered by React Flow",
                  "Auto-drawn foreign key relationships",
                  "Export to PDF or .sql file",
                ].map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: TEXT2 }}>
                    <CheckCircle2 size={14} style={{ color: SUCCESS, flexShrink: 0 }} />
                    {t}
                  </div>
                ))}
              </div>
              <Link href="/dashboard/schema-designer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 20px", background: ELEVATED,
                border: `1px solid ${BORDER}`, borderRadius: 8,
                fontSize: 14, fontWeight: 500, color: TEXT1,
                textDecoration: "none", transition: "border-color 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = TEXT3; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
              >
                Try Schema Designer <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Visual side */}
            <motion.div variants={fadeIn} style={{
              flex: "1 1 320px",
              background: "#0d1117",
              borderLeft: `1px solid ${BORDER}`,
              minHeight: 320,
              position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 32,
            }}>
              <GridBg opacity={0.5} />
              {/* Fake canvas nodes */}
              {[
                { t: "Users", x: 40, y: 60, cols: ["id: UUID", "email: TEXT", "created_at: TS"] },
                { t: "Orders", x: 220, y: 160, cols: ["id: UUID", "user_id: UUID →", "total: NUMERIC"] },
              ].map(({ t, x, y, cols }) => (
                <div key={t} style={{
                  position: "absolute", left: x, top: y,
                  background: ELEVATED, border: `1px solid ${BORDER}`,
                  borderRadius: 10, minWidth: 160, overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}>
                  <div style={{
                    padding: "8px 14px",
                    background: "rgba(200,240,77,0.08)", borderBottom: `1px solid ${BORDER}`,
                    ...HEADING, fontSize: 13, color: TEXT1,
                  }}>{t}</div>
                  {cols.map(c => (
                    <div key={c} style={{
                      padding: "5px 14px", ...MONO, fontSize: 10, color: TEXT3,
                      borderBottom: `1px solid rgba(39,40,43,0.5)`,
                    }}>{c}</div>
                  ))}
                </div>
              ))}
              {/* Dashed line between nodes */}
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                <line x1="200" y1="110" x2="220" y2="190" stroke={ACCENT} strokeWidth={1} strokeDasharray="4 4" opacity={0.4} />
              </svg>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Testimonials ── */}
        <section style={{
          background: SURFACE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
          padding: "clamp(64px, 8vw, 100px) clamp(20px, 5vw, 48px)",
          position: "relative", overflow: "hidden",
        }}>
          <GridBg opacity={0.15} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <SectionLabel>Testimonials</SectionLabel>
              <h2 style={{ ...HEADING, fontSize: "clamp(24px, 4vw, 44px)" }}>
                What people are saying.
              </h2>
            </div>
            <TestimonialCarousel />
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section style={{
          padding: "clamp(100px, 14vw, 160px) clamp(20px, 5vw, 48px)",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <GridBg />
          <div style={{
            position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: 700, height: 350, borderRadius: "50%", background: ACCENT,
            filter: "blur(150px)", opacity: 0.06, pointerEvents: "none",
          }} />
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}
          >
            <motion.div variants={fadeUp}>
              <SectionLabel>Get started</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              style={{ ...HEADING, fontSize: "clamp(36px, 7vw, 72px)", lineHeight: 1.04, marginBottom: 24 }}
            >
              Stop waiting.<br />Start asking.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{ fontSize: 18, color: TEXT2, lineHeight: 1.65, marginBottom: 44 }}
            >
              Your database already has every answer you need.
              QueryMind just helps you ask the question.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <SignedOut>
                <Link href="/sign-up" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "18px 40px", background: ACCENT, color: BG,
                  borderRadius: 12, fontWeight: 700, fontSize: 17,
                  textDecoration: "none",
                  boxShadow: "0 0 60px rgba(200,240,77,0.22)",
                  transition: "transform 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                >
                  Start for free <ArrowRight size={18} />
                </Link>
                <span style={{ ...MONO, fontSize: 11, color: TEXT3 }}>
                  No credit card · Connects in 30 seconds · Works with any Postgres DB
                </span>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "16px 32px", background: ACCENT, color: BG,
                  borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: "none",
                }}>
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              </SignedIn>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{
        background: SURFACE, borderTop: `1px solid ${BORDER}`,
        padding: "40px clamp(20px, 5vw, 48px)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", flexWrap: "wrap", gap: 24,
          alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src="/logo-horizontal.svg" alt="QueryMind" style={{ height: 20, opacity: 0.7 }} />
            <span style={{ ...MONO, fontSize: 11, color: TEXT3 }}>
              © {new Date().getFullYear()} QueryMind
            </span>
            <span style={{ ...MONO, fontSize: 10, color: TEXT3, padding: "3px 8px", border: `1px solid ${BORDER}`, borderRadius: 4 }}>
              Your database, in plain English.
            </span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map(l => (
              <Link key={l} href="#" style={{ fontSize: 13, color: TEXT3, textDecoration: "none" }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = TEXT2; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = TEXT3; }}
              >{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}