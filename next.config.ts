import type { NextConfig } from "next";
import path from "path";

// Turbopack otherwise picks the repo root (D:\QueryMind) when multiple lockfiles exist,
// so `tailwindcss` and other frontend devDependencies fail to resolve.
const turbopackRoot = path.resolve(__dirname);

// #region agent log
fetch("http://127.0.0.1:7822/ingest/67f75c85-8037-4bf8-9796-950c69980508", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "a27e12",
  },
  body: JSON.stringify({
    sessionId: "a27e12",
    hypothesisId: "H1",
    location: "next.config.ts:load",
    message: "turbopack root configured",
    data: { turbopackRoot, cwd: process.cwd() },
    timestamp: Date.now(),
    runId: "pre-fix-verify",
  }),
}).catch(() => {});
// #endregion

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
};

export default nextConfig;
