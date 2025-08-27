"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CreditCard, Plus, Download } from "lucide-react";
import { CreatePaymentForm } from "@/components/forms/CreatePaymentForm";

export function PaymentsActionsBar({ total }: { total: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <div
        className="glass"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 12,
        }}
      >
        <CreditCard size={18} />
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontWeight: 600, lineHeight: 1 }}>Payments</div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              lineHeight: 1,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18 }}>{total}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              Total
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant="glass"
          title="Export CSV"
          aria-label="Export CSV"
          leftIcon={<Download size={16} />}
          onClick={() => {
            /* optional: hook up CSV later */
          }}
        />
        <Button
          variant="primary"
          title="Add Payment"
          aria-label="Add Payment"
          leftIcon={<Plus size={16} />}
          onClick={() => setOpen(true)}
        />
      </div>
      {open && (
        <div role="dialog" aria-modal="true" className="modal-overlay">
          <div
            className="glass"
            style={{ width: "min(720px, 96vw)", padding: 16, borderRadius: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <strong>New Payment</strong>
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                style={{
                  border:
                    "1px solid color-mix(in oklab, var(--danger), black 18%)",
                  background: "var(--danger)",
                  color: "#fff",
                  padding: 6,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            <CreatePaymentForm />
          </div>
        </div>
      )}
    </div>
  );
}
