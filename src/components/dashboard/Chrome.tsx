"use client";
import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SignOutButton } from "@/components/SignOutButton";
import { usePathname } from "next/navigation";
import styles from "./chrome.module.css";
import { Menu } from "lucide-react";

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
  const pathname = usePathname() as string;

  return (
    <div className={`shell ${styles.gradientBg}`}>
      {/* Sidebar / Drawer */}
      <aside className={`sidebar glass ${styles.sidebarCard}`}>
        {/* Mobile top bar overlay toggle space */}
        <div className="only-mobile" style={{ display: "none" }} />
        <div className={styles.gridGap12}>
          <div className={styles.rowBetween}>
            <div className={styles.fw700}>
              <Link
                href={"/" as Route}
                className={`glass-press ${styles.row}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src="/goldbod-logo.webp"
                  alt="GoldBod"
                  width={24}
                  height={24}
                  style={{ borderRadius: 6 }}
                />
                <span>GoldBod</span>
              </Link>
            </div>
            <div className="hide-desktop" style={{ display: "none" }}>
              <button
                aria-label="Close menu"
                className="icon-btn"
                onClick={() => setOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* User card */}
          <div className={`glass ${styles.userCard}`}>
            {user ? (
              <div className={styles.userGrid}>
                <div className={styles.userName}>{user.name || user.email}</div>
                <div className={styles.userRole}>
                  Role: {role || "AUTHENTICATED"}
                </div>
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
            <ul className={styles.navList}>
              {items.map((i) => {
                const isActive =
                  pathname === i.href ||
                  pathname.startsWith(`/(${"app"})${i.href}`) ||
                  (i.href !== "/" && pathname.startsWith(i.href));
                return (
                  <li key={i.label}>
                    <Link
                      href={i.href}
                      className={`glass-press ${styles.navItem} ${
                        isActive ? styles.active : ""
                      } ${styles.sheen}`}
                    >
                      <span aria-hidden>{i.icon}</span>
                      <span>{i.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Content area */}
      <section className="content">
        {/* Top bar (mobile) */}
        <div className={`glass ${styles.topBar}`}>
          <div className={styles.row}>
            <button
              aria-label="Open menu"
              className="icon-btn hide-desktop"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <Link
              href={"/" as Route}
              className={styles.row}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src="/goldbod-logo.webp"
                alt="GoldBod"
                width={20}
                height={20}
                style={{ borderRadius: 4 }}
              />
              <strong>Dashboard</strong>
            </Link>
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
          className={styles.overlay}
        >
          <div
            className={`glass ${styles.drawer}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${styles.rowBetween} ${styles.mb12}`}>
              <strong>Menu</strong>
              <button
                aria-label="Close menu"
                className="icon-btn"
                onClick={() => setOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <ul className={styles.navList}>
              {items.map((i) => (
                <li key={i.label}>
                  <Link
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className={`glass-press ${styles.navItem}`}
                  >
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
        @keyframes slide-in {
          from {
            transform: translateX(-8px);
            opacity: 0.8;
          }
          to {
            transform: none;
            opacity: 1;
          }
        }
        @media (min-width: 769px) {
          .hide-desktop {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .shell {
            grid-template-columns: 1fr !important;
          }
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
