"use client";
import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { SignOutButton } from "@/components/SignOutButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export type NavItem = {
  href:
    | "/dashboard"
    | "/dashboard/cases"
    | "/dashboard/payments"
    | "/dashboard/exports"
    | "/";
  label: string;
};

export function DashboardShell({
  children,
  userName,
  role,
  items,
}: {
  children: React.ReactNode;
  userName?: string | null;
  role?: string;
  items: NavItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="layout">
      {/* Topbar for mobile and overall actions */}
      <header className="topbar glass">
        <button
          aria-label="Menu"
          className="icon-btn"
          onClick={() => setOpen(true)}
        >
          ☰
        </button>
        <div className="brand">GoldBod</div>
        <div className="topbar-actions">
          <NotificationBell />
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar glass ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">GoldBod</div>
          <button
            aria-label="Close"
            className="icon-btn"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="user-card">
          {userName ? (
            <div className="user">
              <div className="user-name">{userName}</div>
              <div className="user-role">Role: {role || "AUTHENTICATED"}</div>
              <div className="spacer" />
              <SignOutButton />
            </div>
          ) : (
            <Link href={"/signin" as Route} className="link">
              Sign in
            </Link>
          )}
        </div>
        <nav className="nav">
          <ul>
            {items.map((i) => (
              <li key={i.href}>
                <Link href={i.href as Route} className="nav-link">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      {/* Content */}
      <main className="content">
        <div className="page-enter glass-fade">{children}</div>
      </main>
    </div>
  );
}
