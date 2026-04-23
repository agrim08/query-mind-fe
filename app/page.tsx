"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const NAV_LINKS = ["Dashboard", "History", "Connections", "Settings"] as const;
const DOTS = ["#ef4444", "#f59e0b", "#22c55e"] as const;
const TABLE_ROWS = [
  ["2025-09-01", "$48,291"],
  ["2025-10-01", "$52,840"],
  ["2025-11-01", "$61,003"],
] as const;
const FEATURES = [
  { icon: "⚡", title: "Streaming SQL", desc: "See SQL generate token-by-token in real time." },
  { icon: "🔐", title: "Encrypted Credentials", desc: "Connection strings stored with AES-256 encryption." },
  { icon: "🧠", title: "Context-Aware", desc: "Schema is indexed into Pinecone for accurate queries." },
  { icon: "📜", title: "Full History", desc: "Every query logged with SQL, results, and timing." },
] as const;

export default function LandingPage() {
  return (
    <main className="landing-page">

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <Link href="/" className="landing-nav-logo">
          <img src="/logo-horizontal.svg" alt="QueryMind" className="h-6 w-auto" />
        </Link>
        <div className="landing-nav-actions">
          <SignedOut>
            <Link href="/sign-in" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/sign-up" className="btn btn-primary btn-sm">Get Started</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-grid-bg" />
        <div className="hero-glow" />

        {/* Badge */}
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span className="hero-badge-label">Powered by Gemini 2.5 Flash</span>
        </div>

        <h1 className="font-heading hero-title">
          Query your database
          <br />
          <span className="logo-accent">in plain English.</span>
        </h1>

        <p className="hero-description">
          Connect your database. Ask your question. Get the answer. No SQL. No developer. No waiting.
        </p>

        <div className="hero-cta-row">
          <SignedOut>
            <Link href="/sign-up" className="btn btn-primary btn-lg">Start for free →</Link>
            <Link href="/sign-in" className="btn btn-secondary btn-lg">Sign in</Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
          </SignedIn>
        </div>

        {/* ── Fake terminal preview ── */}
        <div className="preview-window">
          {/* Window chrome */}
          <div className="preview-window-chrome">
            {DOTS.map((c) => (
              <div key={c} className="preview-window-dot" style={{ background: c }} />
            ))}
            <span className="preview-window-title">querymind — dashboard</span>
          </div>

          <div className="preview-window-body">
            {/* Sidebar mockup */}
            <div className="preview-sidebar">
              {NAV_LINKS.map((item, i) => (
                <div
                  key={item}
                  className={`preview-sidebar-item ${i === 0 ? "preview-sidebar-item--active" : "preview-sidebar-item--inactive"}`}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Main content mockup */}
            <div className="preview-content">
              {/* Query input mockup */}
              <div className="preview-query-box">
                Show me monthly revenue for the last 6 months
                <span className="preview-cursor" />
              </div>

              {/* SQL output — syntax highlighted spans keep their inline colour tokens
                  because these are dynamic data-like values, not layout styles */}
              <div className="preview-sql-block">
                <span className="tok-kw">SELECT </span>
                <span className="tok-fn">DATE_TRUNC</span>
                <span className="tok-pun">(</span>
                <span className="tok-str">&apos;month&apos;</span>
                <span className="tok-pun">, </span>
                <span className="tok-col">created_at</span>
                <span className="tok-pun">)</span>
                <span className="tok-kw"> AS </span>
                <span className="tok-col">month</span>
                <span className="tok-pun">,</span>
                <br />
                <span style={{ paddingLeft: 16 }}>
                  <span className="tok-fn">SUM</span>
                  <span className="tok-pun">(</span>
                  <span className="tok-col">total_amount</span>
                  <span className="tok-pun">)</span>
                  <span className="tok-kw"> AS </span>
                  <span className="tok-col">revenue</span>
                </span>
                <br />
                <span className="tok-kw">FROM </span>
                <span className="tok-tbl">orders</span>
                <br />
                <span className="tok-kw">WHERE </span>
                <span className="tok-col">created_at </span>
                <span className="tok-pun">&gt;= </span>
                <span className="tok-fn">NOW</span>
                <span className="tok-pun">()</span>
                <span className="tok-kw"> - INTERVAL </span>
                <span className="tok-str">&apos;6 months&apos;</span>
                <br />
                <span className="tok-kw">GROUP BY </span>
                <span className="tok-col">month</span>
                <br />
                <span className="tok-kw">ORDER BY </span>
                <span className="tok-col">month</span>
                <span className="tok-kw"> ASC</span>
                <span className="tok-pun">;</span>
              </div>

              {/* Result table mockup */}
              <div className="preview-results-table">
                <div className="preview-results-header">
                  {["month", "revenue"].map((h) => (
                    <div key={h} className="preview-results-header-cell">{h}</div>
                  ))}
                </div>
                {TABLE_ROWS.map(([m, r]) => (
                  <div key={m} className="preview-results-row">
                    <div className="preview-results-cell">{m}</div>
                    <div className="preview-results-cell preview-results-cell--value">{r}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Strip ── */}
      <section className="feature-strip">
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="feature-card">
            <div className="feature-card-icon">{icon}</div>
            <h3 className="font-heading feature-card-title">{title}</h3>
            <p className="feature-card-desc">{desc}</p>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <img src="/logo-horizontal.svg" alt="QueryMind" style={{ height: "20px", width: "auto", opacity: 0.8 }} />
        <span className="landing-footer-copy">© 2025 QueryMind. All rights reserved.</span>
      </footer>
    </main>
  );
}
