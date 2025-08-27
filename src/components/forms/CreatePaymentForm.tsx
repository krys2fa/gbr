"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function CreatePaymentForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      caseRef: String(fd.get("caseRef") || ""),
      amount: Number(fd.get("amount")),
      method: String(fd.get("method") || "cash"),
      reference: String(fd.get("reference") || ""),
    };
    try {
      setLoading(true);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setMsg("Payment recorded");
      e.currentTarget.reset();
    } catch (err: any) {
      setMsg(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form
      onSubmit={onSubmit}
      className="glass"
      style={{ padding: 12, marginTop: 12 }}
    >
      <h3 style={{ marginTop: 0 }}>Record Payment</h3>
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          Case Ref
          <input name="caseRef" required className="input" />
        </label>
        <label>
          Amount (USD)
          <input
            name="amount"
            type="number"
            min={0}
            step={0.01}
            required
            className="input"
          />
        </label>
        <label>
          Method
          <input name="method" className="input" defaultValue="cash" />
        </label>
        <label>
          Reference
          <input name="reference" className="input" />
        </label>
        <div>
          <Button
            variant="primary"
            disabled={loading}
            type="submit"
            leftIcon={<Plus size={16} />}
            aria-label="Record Payment"
            title="Record Payment"
          >
            <span className="label-desktop">
              {loading ? "Submitting…" : "Record"}
            </span>
          </Button>
        </div>
        {msg && (
          <div style={{ color: msg.includes("recorded") ? "#0a0" : "#a00" }}>
            {msg}
          </div>
        )}
      </div>
    </form>
  );
}
