"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="font-heading" style={{ fontSize: 28, marginBottom: 6 }}>Settings</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          Manage your account, authentication, and preferences.
        </p>
      </div>

      <div
        style={{
          background: "var(--bg-raised)",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <UserProfile
          appearance={{
            variables: {
              colorBackground:        "var(--bg-raised)",
              colorText:              "var(--text-primary)",
              colorTextSecondary:     "var(--text-secondary)",
              colorPrimary:           "var(--accent)",
              colorInputBackground:   "var(--bg-overlay)",
              colorInputText:         "var(--text-primary)",
              borderRadius:           "10px",
              fontFamily:             "Inter, sans-serif",
            },
            elements: {
              card:                   { boxShadow: "none", background: "transparent" },
              navbarMobileMenuButton: { display: "none" },
            },
          }}
        />
      </div>
    </div>
  );
}
