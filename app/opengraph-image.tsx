import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

// Social share card for Twitter/X, LinkedIn, Slack, etc. (also used as the Twitter image).
export const alt = "QueryMind — Your database, in plain English.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#080909";
const ACCENT = "#c8f04d";
const TEXT = "#f0f1f2";
const MUTED = "#8a8d93";
const LINE = "#252830";

export default function OpengraphImage() {
  const host = SITE_URL.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: BG,
          backgroundImage: `radial-gradient(${LINE} 1.5px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
          color: TEXT,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect x="2" y="2" width="28" height="28" rx="8" fill="none" stroke={TEXT} strokeWidth="2.5" />
            <path d="M10 11l5 5-5 5M16 21h6" stroke={ACCENT} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em" }}>QueryMind</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.045em" }}>
            Query your database
          </div>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.045em" }}>
            <span>in&nbsp;</span>
            <span style={{ color: ACCENT }}>plain English.</span>
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: MUTED, maxWidth: 900, lineHeight: 1.35 }}>
            Ask a question. Get validated, read-only SQL and live results from your Postgres database.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MUTED }}>
          <span>Read-only by design · Any Postgres</span>
          <span style={{ color: TEXT }}>{host}</span>
        </div>
      </div>
    ),
    size,
  );
}
