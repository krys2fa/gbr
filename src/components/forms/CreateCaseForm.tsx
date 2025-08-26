"use client";
import { useState } from "react";

export function CreateCaseForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      applicantEmail: String(fd.get("applicantEmail") || ""),
      karat: Number(fd.get("karat")),
      weightGrams: Number(fd.get("weightGrams")),
      impuritiesPct: Number(fd.get("impuritiesPct") || 0),
    };
    try {
      setLoading(true);
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setMsg(`Created case: ${json.ref}`);
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
      <h3 style={{ marginTop: 0 }}>New Case</h3>
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          Applicant Email
          <input
            name="applicantEmail"
            type="email"
            required
            className="input"
          />
        </label>
        <label>
          Karat
          <input
            name="karat"
            type="number"
            min={8}
            max={24}
            required
            className="input"
          />
        </label>
        <label>
          Weight (g)
          <input
            name="weightGrams"
            type="number"
            min={0}
            step={0.01}
            required
            className="input"
          />
        </label>
        <label>
          Impurities (%)
          <input
            name="impuritiesPct"
            type="number"
            min={0}
            max={20}
            step={0.1}
            className="input"
          />
        </label>
        <div>
          <button
            disabled={loading}
            className="btn-glass btn-inline"
            type="submit"
          >
            {loading ? "Submitting…" : "Create Case"}
          </button>
        </div>
        {msg && (
          <div style={{ color: msg.startsWith("Created") ? "#0a0" : "#a00" }}>
            {msg}
          </div>
        )}
      </div>
    </form>
  );
}
