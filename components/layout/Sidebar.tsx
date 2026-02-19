"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  History,
  Database,
  TableProperties,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useUiStore } from "@/lib/uiStore";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/history",   label: "History",    icon: History },
  { href: "/connections", label: "Connections", icon: Database },
  { href: "/schema",    label: "Schema",     icon: TableProperties },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isSidebarCollapsed, toggleSidebar, closeMobileMenu } = useUiStore();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div
        style={{
          padding: isSidebarCollapsed ? "20px 0" : "20px 16px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: isSidebarCollapsed ? "center" : "flex-start",
          height: 70,
          alignItems: "center",
          transition: "padding 0.3s ease",
        }}
      >
        {!isSidebarCollapsed ? (
          <span
            className="font-heading"
            style={{ fontSize: "20px", color: "var(--text-primary)", letterSpacing: "-0.04em" }}
          >
            Query
            <span style={{ color: "var(--accent)" }}>Mind</span>
          </span>
        ) : (
          <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: "24px" }}>Q</span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, paddingTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
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
      </nav>

      {/* Collapse Toggle (Desktop Only) */}
      <div 
        className="hide-mobile"
        style={{ 
          padding: "8px", 
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: isSidebarCollapsed ? "center" : "flex-start"
        }}
      >
        <button
          onClick={toggleSidebar}
          className="nav-item btn-ghost"
          style={{ width: "100%", justifyContent: isSidebarCollapsed ? "center" : "flex-end", border: "none" }}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
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
          gap: "4px"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: isSidebarCollapsed ? "0" : "8px 16px",
            justifyContent: isSidebarCollapsed ? "center" : "flex-start",
            marginBottom: "4px"
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
          
          <div className="user-details" style={{ flex: 1, minWidth: 0, display: isSidebarCollapsed ? "none" : "block" }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.firstName ?? "User"}
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
          style={{ width: "100%", border: "none", background: "none", textAlign: "left", justifyContent: isSidebarCollapsed ? "center" : "flex-start" }}
          title={isSidebarCollapsed ? "Sign out" : undefined}
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span className="sidebar-text">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
