"use client";
import { useState } from "react";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(2);
  const items = [
    { id: 1, text: "Valuation updated for Case #1024" },
    { id: 2, text: "New payment recorded for INV-8834" },
  ];
  return (
    <div className="notif">
      <button aria-label="Notifications" className="icon-btn" onClick={() => setOpen((v) => !v)}>
        🔔{count > 0 ? <span className="badge">{count}</span> : null}
      </button>
      {open && (
        <div className="notif-pop glass">
          <div className="notif-head">Notifications</div>
          <ul>
            {items.map((n) => (
              <li key={n.id}>{n.text}</li>
            ))}
          </ul>
          <button className="link" onClick={() => { setCount(0); setOpen(false); }}>Mark all read</button>
        </div>
      )}
    </div>
  );
}
