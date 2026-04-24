"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Lock, Zap, Users, ArrowRight, X } from "lucide-react";

interface UpgradePromptProps {
  requiredPlan: "pro" | "team";
  title?: string;
  description?: string;
  currentCount?: number;
  limit?: number;
  /** Show the prompt inline (no full-page centering) */
  inline?: boolean;
}

const PLAN_META = {
  pro: {
    label: "Pro",
    price: "$12/mo",
    color: "#c8f04d",
    bg: "rgba(200,240,77,0.06)",
    border: "rgba(200,240,77,0.2)",
    icon: Zap,
    perks: [
      "5 database connections",
      "Unlimited queries",
      "6 DB designs per month",
      "CSV export",
    ],
  },
  team: {
    label: "Team",
    price: "$39/mo",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.06)",
    border: "rgba(96,165,250,0.2)",
    icon: Users,
    perks: [
      "Unlimited connections",
      "Unlimited queries",
      "Unlimited DB designs",
      "CSV export",
      "PDF history export",
    ],
  },
} as const;

export default function UpgradePrompt({
  requiredPlan,
  title,
  description,
  currentCount,
  limit,
  inline = false,
}: UpgradePromptProps) {
  const meta = PLAN_META[requiredPlan];
  const Icon = meta.icon;

  const defaultTitle =
    requiredPlan === "pro"
      ? "Pro plan required"
      : "Team plan required";

  const defaultDescription =
    currentCount !== undefined && limit !== undefined
      ? `You've used ${currentCount} of ${limit} on your current plan.`
      : `This feature requires the ${meta.label} plan.`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: inline ? "flex-start" : "center",
        justifyContent: "center",
        padding: inline ? "24px" : "48px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "var(--bg-raised)",
          border: `1px solid ${meta.border}`,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Top accent stripe */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${meta.color}, transparent)`,
          }}
        />

        <div style={{ padding: "24px" }}>
          {/* Icon + heading */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: meta.bg,
                border: `1px solid ${meta.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={17} style={{ color: meta.color }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                }}
              >
                {title ?? defaultTitle}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "Geist Mono, monospace",
                    color: meta.color,
                    background: meta.bg,
                    border: `1px solid ${meta.border}`,
                    padding: "1px 7px",
                    borderRadius: 4,
                  }}
                >
                  {meta.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "Geist Mono, monospace",
                    color: "var(--text-tertiary)",
                  }}
                >
                  {meta.price}
                </span>
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            {description ?? defaultDescription}
          </p>

          {/* Perks list */}
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 20px",
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {meta.perks.map((perk) => (
              <li
                key={perk}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: meta.color,
                    flexShrink: 0,
                  }}
                />
                {perk}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/billing"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 0",
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: meta.color,
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
          >
            Upgrade to {meta.label}
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Centered modal overlay with backdrop blur.
 * Drop this at root level in any page; pass onClose to dismiss.
 */
export function UpgradeModal({
  requiredPlan,
  title,
  description,
  onClose,
}: {
  requiredPlan: "pro" | "team";
  title?: string;
  description?: string;
  onClose: () => void;
}) {
  const meta = PLAN_META[requiredPlan];
  const Icon = meta.icon;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const defaultTitle = `${meta.label} plan required`;
  const defaultDescription = `This feature requires the ${meta.label} plan.`;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(8,9,9,0.75)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: 420, width: "100%",
          background: "#0e0f10",
          border: `1px solid ${meta.border}`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px ${meta.color}18`,
          position: "relative",
          animation: "modalIn 0.22s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

        {/* Top accent line */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${meta.color}, transparent)` }} />

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.05)", border: "none",
            borderRadius: 7, padding: "5px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#4d5057", transition: "color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#f0f1f2"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#4d5057"; }}
        >
          <X size={15} />
        </button>

        <div style={{ padding: "24px" }}>
          {/* Icon + heading */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: meta.bg, border: `1px solid ${meta.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon size={18} style={{ color: meta.color }} />
            </div>
            <div>
              <div style={{
                fontSize: 16, fontWeight: 700, color: "#f0f1f2",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                marginBottom: 3,
              }}>
                {title ?? defaultTitle}
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{
                  fontSize: 11, fontFamily: "Geist Mono, monospace",
                  color: meta.color, background: meta.bg,
                  border: `1px solid ${meta.border}`,
                  padding: "1px 7px", borderRadius: 4,
                }}>
                  {meta.label}
                </span>
                <span style={{ fontSize: 11, fontFamily: "Geist Mono, monospace", color: "#4d5057" }}>
                  {meta.price}
                </span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: "#8a8d93", lineHeight: 1.65, marginBottom: 18 }}>
            {description ?? defaultDescription}
          </p>

          {/* Perks */}
          <ul style={{
            listStyle: "none", padding: 0, margin: "0 0 22px",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {meta.perks.map((perk) => (
              <li key={perk} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#8a8d93" }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: meta.bg, border: `1px solid ${meta.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: meta.color }} />
                </div>
                {perk}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/billing"
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 0", borderRadius: 10,
              background: meta.bg, border: `1px solid ${meta.border}`,
              fontSize: 14, fontWeight: 700, color: meta.color,
              textDecoration: "none", transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            Upgrade to {meta.label}
            <ArrowRight size={13} />
          </Link>

          <p style={{
            marginTop: 12, fontSize: 11, color: "#4d5057",
            fontFamily: "Geist Mono, monospace", textAlign: "center",
          }}>
            Cancel anytime · Powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

/** Small inline lock badge — use in headers/buttons to signal gated features */
export function PlanLockBadge({
  plan,
}: {
  plan: "pro" | "team";
}) {
  const meta = PLAN_META[plan];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 7px",
        borderRadius: 4,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        fontSize: 10,
        fontFamily: "Geist Mono, monospace",
        color: meta.color,
        verticalAlign: "middle",
        marginLeft: 6,
      }}
    >
      <Lock size={9} />
      {meta.label}
    </span>
  );
}
