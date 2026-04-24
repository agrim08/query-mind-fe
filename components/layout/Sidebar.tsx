"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk, useAuth } from "@clerk/nextjs";
import {
  LayoutDashboard,
  History,
  Database,
  TableProperties,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  CreditCard,
  Zap,
  Users,
} from "lucide-react";
import { useUiStore } from "@/lib/uiStore";

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/history",     label: "History",     icon: History },
  { href: "/design",      label: "Design DB",   icon: PenTool },
  { href: "/connections", label: "Connections", icon: Database },
  { href: "/schema",      label: "Schema",      icon: TableProperties },
];

function PlanBadge() {
  const { has } = useAuth();

  const isTeam = has?.({ feature: "team_tier" });
  const isPro = has?.({ feature: "pro_tier" });

  if (isTeam) {
    return (
      <span
        style={{
          fontSize: 9,
          fontFamily: "Geist Mono, monospace",
          fontWeight: 600,
          color: "#60a5fa",
          background: "rgba(96,165,250,0.1)",
          border: "1px solid rgba(96,165,250,0.2)",
          padding: "1px 6px",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexShrink: 0,
        }}
      >
        <Users size={8} />
        TEAM
      </span>
    );
  }

  if (isPro) {
    return (
      <span
        style={{
          fontSize: 9,
          fontFamily: "Geist Mono, monospace",
          fontWeight: 600,
          color: "#c8f04d",
          background: "rgba(200,240,77,0.08)",
          border: "1px solid rgba(200,240,77,0.2)",
          padding: "1px 6px",
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexShrink: 0,
        }}
      >
        <Zap size={8} />
        PRO
      </span>
    );
  }

  return (
    <Link
      href="/billing"
      style={{
        fontSize: 9,
        fontFamily: "Geist Mono, monospace",
        fontWeight: 600,
        color: "var(--text-tertiary)",
        background: "var(--bg-overlay)",
        border: "1px solid var(--border-subtle)",
        padding: "1px 6px",
        borderRadius: 4,
        textDecoration: "none",
        flexShrink: 0,
      }}
    >
      FREE
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isSidebarCollapsed, toggleSidebar, closeMobileMenu } = useUiStore();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link href="/">
        <div
          style={{
            padding: isSidebarCollapsed ? "16px 0" : "20px 16px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: isSidebarCollapsed ? "center" : "flex-start",
            height: 70,
            alignItems: "center",
            transition: "all 0.3s ease",
          }}
        >
          {!isSidebarCollapsed ? (
            <img
              src="/logo-horizontal.svg"
              alt="QueryMind"
              style={{ height: "26px", width: "auto" }}
            />
          ) : (
            <img
              src="/logo-icon.svg"
              alt="Q"
              style={{ height: "32px", width: "32px" }}
            />
          )}
        </div>
      </Link>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          paddingTop: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={closeMobileMenu}
              className={`nav-item${active ? " active" : ""}`}
              title={isSidebarCollapsed ? label : undefined}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              <span className="sidebar-text">{label}</span>
              {active && !isSidebarCollapsed && (
                <ChevronRight
                  size={14}
                  style={{ marginLeft: "auto", color: "var(--accent)" }}
                />
              )}
            </Link>
          );
        })}

        {/* Billing — separated with a subtle divider */}
        <div
          style={{
            height: 1,
            background: "var(--border-subtle)",
            margin: "6px 12px",
          }}
        />
        <Link
          href="/billing"
          onClick={closeMobileMenu}
          className={`nav-item${pathname === "/billing" ? " active" : ""}`}
          title={isSidebarCollapsed ? "Billing" : undefined}
        >
          <CreditCard
            size={18}
            strokeWidth={pathname === "/billing" ? 2 : 1.5}
          />
          <span className="sidebar-text">Billing</span>
          {pathname === "/billing" && !isSidebarCollapsed && (
            <ChevronRight
              size={14}
              style={{ marginLeft: "auto", color: "var(--accent)" }}
            />
          )}
        </Link>
      </nav>

      {/* Collapse Toggle (Desktop Only) */}
      <div
        className="hide-mobile"
        style={{
          padding: "8px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: isSidebarCollapsed ? "center" : "flex-start",
        }}
      >
        <button
          onClick={toggleSidebar}
          className="nav-item btn-ghost"
          style={{
            width: "100%",
            justifyContent: isSidebarCollapsed ? "center" : "flex-end",
            border: "none",
          }}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* User section */}
      <div
        className="user-section"
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "12px 0 8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: isSidebarCollapsed ? "0" : "8px 16px",
            justifyContent: isSidebarCollapsed ? "center" : "flex-start",
            marginBottom: "4px",
          }}
        >
          {/* Avatar */}
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName ?? "User"}
              style={{
                width: 28,
                height: 28,
                borderRadius: "9999px",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "9999px",
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-emphasis)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "var(--text-secondary)",
                flexShrink: 0,
              }}
            >
              {user?.firstName?.[0] ?? "U"}
            </div>
          )}

          <div
            className="user-details"
            style={{
              flex: 1,
              minWidth: 0,
              display: isSidebarCollapsed ? "none" : "block",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 3,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                {user?.firstName ?? "User"}
              </div>
              <PlanBadge />
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-tertiary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="nav-item"
          style={{
            width: "100%",
            border: "none",
            background: "none",
            textAlign: "left",
            justifyContent: isSidebarCollapsed ? "center" : "flex-start",
          }}
          title={isSidebarCollapsed ? "Sign out" : undefined}
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span className="sidebar-text">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
