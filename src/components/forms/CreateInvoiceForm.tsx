"use client";
import { useState } from "react";

export function CreateInvoiceForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = Object.fromEntries(fd.entries());
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCardId: p.jobCardId,
          invoiceNo: p.invoiceNo,
          amount: String(p.amount || "0"),
          currency: p.currency || "USD",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create invoice");
      e.currentTarget.reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      onSubmit={onSubmit}
      className="glass"
      style={{ padding: 12, margin: "12px 0" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 8,
        }}
      >
        <label>
          Job Card ID
          <input name="jobCardId" className="input" required />
        </label>
        <label>
          Invoice No
          <input name="invoiceNo" className="input" required />
        </label>
        <label>
          Amount
          <input name="amount" className="input" required />
        </label>
        <label>
          Currency
          <input name="currency" className="input" defaultValue="USD" />
        </label>
      </div>
      <div
        style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}
      >
        <button
          className="btn-glass btn-inline"
          disabled={loading}
          type="submit"
        >
          {loading ? "Saving..." : "Create Invoice"}
        </button>
        {error && <span style={{ color: "#f66" }}>{error}</span>}
      </div>
    </form>
  );
}
