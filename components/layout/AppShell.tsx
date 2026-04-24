"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useConnectionStore } from "@/lib/store";
import { useUiStore } from "@/lib/uiStore";
import { getConnections, syncUser } from "@/lib/api";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ApiTokenProvider from "@/components/providers/ApiTokenProvider";
import ToastProvider from "@/components/providers/ToastProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const setConnections = useConnectionStore((s) => s.setConnections);
  const setConnectionsLoading = useConnectionStore((s) => s.setConnectionsLoading);
  const { isLoaded, isSignedIn, user } = useUser();
  const { isSidebarCollapsed, isMobileMenuOpen, closeMobileMenu } = useUiStore();
  const pathname = usePathname();
  const isFullWidthPage = pathname === "/design";

  // Body class effect removed, using className on div instead.
  
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const init = async () => {
      try {
        await syncUser({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? "",
          full_name: user.fullName ?? undefined,
          avatar_url: user.imageUrl ?? undefined,
        });
      } catch (err) {
        console.error("syncUser failed:", err);
      }

      try {
        setConnectionsLoading(true);
        const conns = await getConnections();
        setConnections(conns);
      } catch (err) {
        console.error("getConnections failed:", err);
        setConnectionsLoading(false);
      }
    };

    init();
  }, [isLoaded, isSignedIn, user, setConnections, setConnectionsLoading]);

  return (
    <ApiTokenProvider>
      <ToastProvider />
      <div 
        className={`app-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""} ${isMobileMenuOpen ? "mobile-menu-open" : ""}`}
      >
        <div className="mobile-overlay" onClick={closeMobileMenu} />
        <Sidebar />
        <div className="main-content">
          <Topbar />
          <main className={`page-content ${isFullWidthPage ? "no-padding" : ""}`}>{children}</main>
        </div>
      </div>
    </ApiTokenProvider>
  );
}
