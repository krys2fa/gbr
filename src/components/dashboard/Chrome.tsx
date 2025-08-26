"use client";
import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SignOutButton } from "@/components/SignOutButton";

type NavItem = { href: Route; label: string; icon?: React.ReactNode };

export function DashboardChrome({
  user,
  role,
  items,
  children,
}: {
  user?: { name?: string | null; email?: string | null } | null;
  role?: string;
  items: NavItem[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="shell" style={{ background: "linear-gradient(120deg,#eef2ff,#f8fafc)" }}>
      {/* Sidebar / Drawer */}
      <aside
        className="sidebar glass"
        style={{
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,.45)",
          boxShadow: "0 12px 40px rgba(15,23,42,.08)",
          margin: 12,
          height: "calc(100vh - 24px)",
          position: "sticky",
          top: 12,
          transform: undefined,
        }}
      >
        {/* Mobile top bar overlay toggle space */}
        <div className="only-mobile" style={{ display: "none" }} />
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700 }}>GoldBod</div>
            <div className="hide-desktop" style={{ display: "none" }}>
              <button aria-label="Close menu" className="icon-btn" onClick={() => setOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>

          {/* User card */}
          <div className="glass" style={{ padding: 12, borderRadius: 14 }}>
            {user ? (
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontWeight: 600 }}>{user.name || user.email}</div>
                <div style={{ color: "var(--ink-dim)", fontSize: 12 }}>Role: {role || "AUTHENTICATED"}</div>
                <div>
                  <SignOutButton />
                </div>
              </div>
            ) : (
              <Link href={"/signin" as Route}>Sign in</Link>
            )}
          </div>

          {/* Nav */}
          <nav>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {items.map((i) => (
                <li key={i.label}>
                  <Link
                    href={i.href}
                    className="glass-press"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "20px 1fr",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      color: "var(--ink)",
                    }}
                  >
                    <span aria-hidden>{i.icon}</span>
                    <span>{i.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Content area */}
      <section className="content">
        {/* Top bar (mobile) */}
        <div
          className="glass"
          style={{
            position: "sticky",
            top: 12,
            zIndex: 10,
            padding: 10,
            borderRadius: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "12px 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button aria-label="Open menu" className="icon-btn" onClick={() => setOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <strong>Dashboard</strong>
          </div>
          <NotificationBell />
        </div>

        <div>{children}</div>
      </section>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.28)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
            zIndex: 50,
          }}
        >
          <div
            className="glass"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "80%",
              maxWidth: 320,
              height: "100%",
              padding: 16,
              borderRadius: 0,
              boxShadow: "24px 0 64px rgba(15,23,42,.22)",
              transform: "translateX(0)",
              animation: "slide-in .16s ease-out",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <strong>Menu</strong>
              <button aria-label="Close menu" className="icon-btn" onClick={() => setOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              {items.map((i) => (
                <li key={i.label}>
                  <Link href={i.href} onClick={() => setOpen(false)} className="glass-press" style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: 10, padding: "10px 12px", borderRadius: 12, color: "var(--ink)" }}>
                    <span aria-hidden>{i.icon}</span>
                    <span>{i.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in{ from{ transform: translateX(-8px); opacity:.8 } to{ transform:none; opacity:1 } }
        @media (min-width: 769px){
          .hide-desktop{ display:none !important }
        }
        @media (max-width: 768px){
          .shell{ grid-template-columns: 1fr !important }
          .sidebar{ display:none }
        }
      `}</style>
    </div>
  );
}
