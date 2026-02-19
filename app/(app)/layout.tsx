import AppShell from "@/components/layout/AppShell";

// Auth is handled entirely by proxy.ts (Clerk middleware).
// No server-side auth() call needed here — avoids Clerk API calls at build time.
export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
