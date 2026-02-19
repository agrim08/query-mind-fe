import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QueryMind — Sign In",
  description: "Sign in to QueryMind and query any database in plain English.",
};

const DOTS = ["#ef4444", "#f59e0b", "#22c55e"] as const;
const STATS = [
  { value: "< 2s", label: "avg. query time" },
  { value: "Gemini", label: "SQL accuracy" },
  { value: "AES-256", label: "encrypted creds" },
] as const;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-layout">

      {/* ── Left panel: form ── */}
      <div className="auth-panel-left">

        {/* Logo */}
        <a href="/" className="auth-logo-link">
          <div className="logo-mark logo-mark-md">Q</div>
          <span className="font-heading logo-wordmark" style={{ fontSize: 20, color: "var(--text-primary)" }}>
            Query<span className="logo-accent">Mind</span>
          </span>
        </a>

        {/* Clerk component */}
        <div className="auth-clerk-wrapper">{children}</div>

        {/* Legal footer */}
        <p className="auth-legal">
          By continuing, you agree to our{" "}
          <span className="auth-legal-link">Terms</span>{" "}
          and{" "}
          <span className="auth-legal-link">Privacy Policy</span>.
        </p>
      </div>

      {/* ── Right panel: decorative ── */}
      <div className="auth-right-panel">
        <div className="auth-panel-grid-bg" />
        <div className="auth-panel-glow" />

        <div className="auth-panel-content">
          {/* Terminal mockup */}
          <div className="auth-terminal">
            <div className="auth-terminal-header">
              {DOTS.map((c) => (
                <div key={c} className="auth-terminal-dot" style={{ background: c }} />
              ))}
              <span className="auth-terminal-title">querymind — nl → sql</span>
            </div>

            <div className="auth-terminal-body">
              <p className="tok-cmt">
                <span className="logo-accent">▶</span> Show me top 10 customers by revenue
              </p>
              <p className="tok-kw">SELECT</p>
              <p style={{ paddingLeft: 16 }}>
                <span className="tok-col">c.name</span>,{" "}
                <span className="tok-fn">SUM</span>(
                <span className="tok-col">o.total</span>){" "}
                <span className="tok-kw">AS</span>{" "}
                <span className="tok-col">revenue</span>
              </p>
              <p className="tok-kw">FROM</p>
              <p style={{ paddingLeft: 16 }}>
                <span className="tok-tbl">customers</span>{" "}
                <span className="tok-kw">c</span>
              </p>
              <p className="tok-kw">
                JOIN <span className="tok-tbl">orders</span>{" "}
                <span className="tok-kw">o</span>{" "}
                ON{" "}
                <span className="tok-col">c.id</span> ={" "}
                <span className="tok-col">o.customer_id</span>
              </p>
              <p className="tok-kw">
                GROUP BY <span className="tok-col">c.name</span>
              </p>
              <p className="tok-kw">
                ORDER BY <span className="tok-col">revenue</span>{" "}
                DESC
              </p>
              <p className="tok-kw">
                LIMIT <span className="tok-num">10</span>;
              </p>
              <p className="tok-cmt" style={{ marginTop: 4 }}>
                <span style={{ color: "var(--success)" }}>✓</span> 10 rows · 24ms
              </p>
            </div>
          </div>

          <h2 className="font-heading auth-panel-heading">
            Talk to your database.
            <br />
            <span className="logo-accent">No SQL required.</span>
          </h2>

          <p className="auth-panel-subtext">
            QueryMind translates English questions into precise SQL, executes them, and returns
            results — instantly.
          </p>

          {/* Stats row */}
          <div className="auth-stats-row">
            {STATS.map(({ value, label }) => (
              <div key={label} className="auth-stat">
                <div className="font-heading auth-stat-value">{value}</div>
                <div className="auth-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
