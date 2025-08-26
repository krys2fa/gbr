"use client";
import { useState } from "react";

export function CreateSealForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const p = Object.fromEntries(new FormData(e.currentTarget).entries());
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/seals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobCardId: p.jobCardId,
          customsName: p.customsName,
          customsNumber: p.customsNumber,
          securitySealNumbers: p.securitySealNumbers,
          pmmcSealNo: p.pmmcSealNo,
          assayCertificateNumber: p.assayCertificateNumber,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create seal");
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
          Customs Name
          <input name="customsName" className="input" required />
        </label>
        <label>
          Customs Number
          <input name="customsNumber" className="input" required />
        </label>
        <label>
          Security Seal Numbers
          <input name="securitySealNumbers" className="input" required />
        </label>
        <label>
          PMMC Seal #<input name="pmmcSealNo" className="input" required />
        </label>
        <label>
          Assay Cert #
          <input name="assayCertificateNumber" className="input" required />
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
          {loading ? "Saving..." : "Create Seal"}
        </button>
        {error && <span style={{ color: "#f66" }}>{error}</span>}
      </div>
    </form>
  );
}
