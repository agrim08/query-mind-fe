import type { NextConfig } from "next";
import path from "path";
import { withSentryConfig } from "@sentry/nextjs/config";

// Turbopack otherwise picks the repo root (D:\QueryMind) when multiple lockfiles exist,
// so `tailwindcss` and other frontend devDependencies fail to resolve.
const turbopackRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
});
