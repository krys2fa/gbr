"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function CreateJobPaymentForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = Object.fromEntries(fd.entries());
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/job-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCardId: p.jobCardId,
          amount: String(p.amount || "0"),
          currency: p.currency || "USD",
          method: p.method || "cash",
          reference: p.reference,
          receiptNo: p.receiptNo || undefined,
          receiptUrl: p.receiptUrl || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to record payment");
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
          Amount
          <input name="amount" className="input" required />
        </label>
        <label>
          Currency
          <input name="currency" className="input" defaultValue="USD" />
        </label>
        <label>
          Method
          <input name="method" className="input" defaultValue="cash" />
        </label>
        <label>
          Reference
          <input name="reference" className="input" required />
        </label>
        <label>
          Receipt #<input name="receiptNo" className="input" />
        </label>
        <label>
          Receipt URL
          <input name="receiptUrl" className="input" />
        </label>
      </div>
      <div
        style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}
      >
        <Button
          variant="primary"
          disabled={loading}
          type="submit"
          leftIcon={<Plus size={16} />}
          aria-label="Record Payment"
          title="Record Payment"
        >
          <span className="label-desktop">
            {loading ? "Saving..." : "Record Payment"}
          </span>
        </Button>
        {error && <span style={{ color: "#f66" }}>{error}</span>}
      </div>
    </form>
  );
}
