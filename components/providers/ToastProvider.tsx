"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--bg-raised)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-card)",
          fontSize: "13px",
          fontFamily: "'Geist', sans-serif",
        },
        success: {
          iconTheme: { primary: "var(--success)", secondary: "var(--bg-raised)" },
        },
        error: {
          iconTheme: { primary: "var(--error)", secondary: "var(--bg-raised)" },
        },
      }}
    />
  );
}
