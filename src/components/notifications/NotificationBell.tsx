"use client";
import { useEffect, useRef, useState } from "react";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(2);
  const items = [
    { id: 1, text: "Valuation updated for Case #1024" },
    { id: 2, text: "New payment recorded for INV-8834" },
  ];
  // Close on outside click or Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node))
        setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClick);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);
  return (
    <div className="notif">
      <button
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Notifications"
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
      >
        🔔{count > 0 ? <span className="badge">{count}</span> : null}
      </button>
      {open && (
        <div
          ref={popRef}
          className="notif-pop glass"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="notif-head">Notifications</div>
          <ul>
            {items.map((n) => (
              <li key={n.id}>{n.text}</li>
            ))}
          </ul>
          <button
            className="link"
            onClick={() => {
              setCount(0);
              setOpen(false);
            }}
          >
            Mark all read
          </button>
        </div>
      )}
    </div>
  );
}
