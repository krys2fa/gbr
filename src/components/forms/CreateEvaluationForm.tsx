"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function CreateEvaluationForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = Object.fromEntries(fd.entries());
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCardId: p.jobCardId,
          method: p.method || "XRAY",
          lots: p.lots ? Number(p.lots) : undefined,
          grossWeightGrams: p.grossWeightGrams || undefined,
          finenessPercent: p.finenessPercent || undefined,
          netWeightGrams: p.netWeightGrams || undefined,
          netWeightOz: p.netWeightOz || undefined,
          certificateNo: p.certificateNo || undefined,
          notes: p.notes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create evaluation");
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
          Method
          <select name="method" className="input">
            <option>XRAY</option>
            <option>WATER_DENSITY</option>
          </select>
        </label>
        <label>
          Lots
          <input name="lots" className="input" type="number" />
        </label>
        <label>
          Gross Wt (g)
          <input name="grossWeightGrams" className="input" />
        </label>
        <label>
          Fineness %<input name="finenessPercent" className="input" />
        </label>
        <label>
          Net Wt (g)
          <input name="netWeightGrams" className="input" />
        </label>
        <label>
          Net Wt (oz)
          <input name="netWeightOz" className="input" />
        </label>
        <label>
          Cert #<input name="certificateNo" className="input" />
        </label>
        <label>
          Notes
          <input name="notes" className="input" />
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
          aria-label="Add Evaluation"
          title="Add Evaluation"
        >
          <span className="label-desktop">
            {loading ? "Saving..." : "Add Evaluation"}
          </span>
        </Button>
        {error && <span style={{ color: "#f66" }}>{error}</span>}
      </div>
    </form>
  );
}
