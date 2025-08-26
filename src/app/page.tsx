"use client";
import { useState } from "react";

type ValuationInput = {
  karat: number;
  weightGrams: number;
  impuritiesPct: number;
};

export default function Home() {
  const [form, setForm] = useState<ValuationInput>({
    karat: 24,
    weightGrams: 10,
    impuritiesPct: 0,
  });
  const [valuation, setValuation] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [caseRef, setCaseRef] = useState<string | null>(null);

  const onChange =
    (k: keyof ValuationInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [k]: Number(e.target.value) }));
    };

  async function evaluate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setValuation(data.usdValue);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function createCase() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicantEmail: email, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setCaseRef(data.ref);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>Gold Evaluation</h1>
      <p>
        Enter gold details to estimate value. This is indicative; final value
        subject to assay and fees.
      </p>
      <div className="row">
        <div className="col">
          <label>Karat (8-24)</label>
          <input
            type="number"
            min={8}
            max={24}
            value={form.karat}
            onChange={onChange("karat")}
          />
        </div>
        <div className="col">
          <label>Weight (grams)</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.weightGrams}
            onChange={onChange("weightGrams")}
          />
        </div>
        <div className="col">
          <label>Impurities (%)</label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={form.impuritiesPct}
            onChange={onChange("impuritiesPct")}
          />
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={evaluate} disabled={loading}>
          Evaluate
        </button>
      </div>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {valuation !== null && (
        <div style={{ marginTop: 12 }}>
          <strong>Indicative Value:</strong> $
          {valuation.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
      )}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Proceed to Case</h2>
        <label>Contact Email</label>
        <input
          type="email"
          value={email}
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />
        <div style={{ marginTop: 12 }}>
          <button
            onClick={createCase}
            disabled={loading || !valuation || !email}
          >
            Create Case
          </button>
        </div>
        {caseRef && (
          <p style={{ marginTop: 8 }}>
            Case created: <strong>{caseRef}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
