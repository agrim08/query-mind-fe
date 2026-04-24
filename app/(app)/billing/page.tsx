"use client";

import { useAuth } from "@clerk/nextjs";
import { PricingTable } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Zap, Users, ShieldCheck, CreditCard } from "lucide-react";

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
const ELEVATED = "#141516";
const BORDER   = "#27282b";
const ACCENT   = "#c8f04d";
const TEXT1    = "#f0f1f2";
const TEXT2    = "#8a8d93";
const TEXT3    = "#4d5057";
const INFO     = "#60a5fa";
const HEADING: React.CSSProperties = { fontFamily: "'Bricolage Grotesque', 'Helvetica Neue', sans-serif", fontWeight: 800, letterSpacing: "-0.04em" };
const MONO:    React.CSSProperties = { fontFamily: "'Geist Mono', 'Courier New', monospace" };

/* ─── Plan badge ─────────────────────────────────────────────────────────── */
function CurrentPlanBadge() {
  const { has } = useAuth();
  const isTeam = has?.({ feature: "team_tier" });
  const isPro  = has?.({ feature: "pro_tier" });
  const cfg = isTeam
    ? { label: "Team", color: INFO,   bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.25)",  Icon: Users }
    : isPro
    ? { label: "Pro",  color: ACCENT, bg: "rgba(200,240,77,0.08)",  border: "rgba(200,240,77,0.25)",  Icon: Zap }
    : { label: "Free", color: TEXT3,  bg: ELEVATED,                 border: BORDER,                   Icon: CheckCircle2 };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <cfg.Icon size={14} style={{ color: cfg.color }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>{cfg.label} plan</span>
      {cfg.label === "Free" && <span style={{ ...MONO, fontSize: 11, color: TEXT3 }}>· upgrade below</span>}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function BillingPage() {
  return (
    <div className="qm-billing">

      {/*
        Key insight: Clerk's PricingTable opens an inline checkout PANEL to the right
        of the plan cards (not a separate modal). When it opens, the table doubles
        in width. We need the full available width with NO maxWidth constraint.

        The .qm-billing-below class is hidden via CSS :has() when the checkout
        panel is active, so it doesn't show through underneath.
      */}
      <style>{`
        .qm-billing {
          width: 100%;
          max-width: 100%;
        }

        /* Header and context are narrower for readability */
        .qm-billing-header {
          max-width: 960px;
          margin: 0 auto 36px;
        }

        /* The PricingTable gets full width so checkout panel has room */
        .qm-billing-table {
          width: 100%;
        }

        /* When Clerk's checkout is open, hide the footer content so the
           checkout panel has a clean background (no text visible behind it) */
        .qm-billing-below {
          max-width: 960px;
          margin: 28px auto 0;
          transition: opacity 0.2s;
        }

        /* Hide footer content when checkout panel is visible */
        .qm-billing:has([class*="checkout"]) .qm-billing-below,
        .qm-billing:has([class*="Checkout"]) .qm-billing-below {
          opacity: 0;
          pointer-events: none;
        }

        /* Button: black text on accent green */
        [class*="pricingTableCardSubscribeButton"],
        [class*="subscribeButton"],
        [class*="SubscribeButton"] {
          color: #080909 !important;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="qm-billing-header">
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: TEXT3, textDecoration: "none", marginBottom: 20 }}>
          <ArrowLeft size={13} /> Back to Dashboard
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
          <div>
            <h1 style={{ ...HEADING, fontSize: 28, color: TEXT1, margin: "0 0 6px" }}>Billing &amp; Plans</h1>
            <p style={{ fontSize: 14, color: TEXT2, margin: 0 }}>Manage your subscription. Payments processed securely via Stripe.</p>
          </div>
          <CurrentPlanBadge />
        </div>

        {/* Section label */}
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "5px 14px", borderRadius: 9999, background: "rgba(200,240,77,0.07)", border: "1px solid rgba(200,240,77,0.2)" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: ACCENT, display: "inline-block" }} />
            <span style={{ ...MONO, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Pricing</span>
          </div>
          <h2 style={{ ...HEADING, fontSize: 26, color: TEXT1, margin: "0 0 8px" }}>Simple, transparent pricing.</h2>
          <p style={{ fontSize: 14, color: TEXT2, margin: 0 }}>Start free. Upgrade when you need more power.</p>
        </div>
      </div>

      {/* ── PricingTable — full width, no constraint ── */}
      <div className="qm-billing-table">
        <PricingTable
          appearance={{
            variables: {
              colorPrimary:               "#c8f04d",
              colorPrimaryForeground:     "#080909",   // black text on green button
              colorBackground:            "#0e0f10",
              colorText:                  "#f0f1f2",
              colorTextSecondary:         "#8a8d93",
              colorInputBackground:       "#141516",
              colorInputText:             "#f0f1f2",
              colorNeutral:               "#8a8d93",
              fontFamily:                 "'Geist', sans-serif",
              fontFamilyButtons:          "'Geist', sans-serif",
              fontSize:                   "14px",
              borderRadius:               "14px",
            },
          }}
        />
      </div>

      {/* ── Trust strip + FAQ — hidden when checkout is open ── */}
      <div className="qm-billing-below">
        {/* Trust strip */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", padding: "16px 24px", background: ELEVATED, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
          {[
            { Icon: ShieldCheck,  text: "Secured by Stripe"  },
            { Icon: CreditCard,   text: "Cancel anytime"     },
            { Icon: CheckCircle2, text: "Instant activation" },
          ].map(({ Icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Icon size={13} style={{ color: ACCENT }} />
              <span style={{ ...MONO, fontSize: 12, color: TEXT2 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { q: "When am I charged?",      a: "Immediately upon subscribing. Subsequent charges occur on the same date each month." },
            { q: "Can I downgrade?",        a: "Yes — cancel or downgrade anytime. Access continues until the end of the billing period." },
            { q: "What counts as a query?", a: "Each natural-language query you submit counts as one, including those that error." },
          ].map(({ q, a }) => (
            <div key={q} style={{ padding: "16px 20px", background: ELEVATED, border: `1px solid ${BORDER}`, borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT1, marginBottom: 6 }}>{q}</div>
              <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.65 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
