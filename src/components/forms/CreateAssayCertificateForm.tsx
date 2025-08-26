"use client";
import { useState } from "react";

export function CreateAssayCertificateForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      exportDocumentNo: String(fd.get("exportDocumentNo") || ""),
      lots: Number(fd.get("lots") || 0),
      grossWeightGrams: Number(fd.get("grossWeightGrams") || 0),
      finenessPercent: Number(fd.get("finenessPercent") || 0),
      netWeightGrams: Number(fd.get("netWeightGrams") || 0),
      netWeightOz: Number(fd.get("netWeightOz") || 0),
      customsSealNo: String(fd.get("customsSealNo") || ""),
      pmmcSealNo: String(fd.get("pmmcSealNo") || ""),
      otherSealNo: String(fd.get("otherSealNo") || ""),
      certificateNo: String(fd.get("certificateNo") || ""),
      date: String(fd.get("date") || ""),
      client: String(fd.get("client") || ""),
      reference: String(fd.get("reference") || ""),
      exporter: String(fd.get("exporter") || ""),
    };
    if (!payload.exportDocumentNo) delete (payload as any).exportDocumentNo;
    try {
      setLoading(true);
      const res = await fetch("/api/assay-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setMsg(`Created certificate: ${json.id}`);
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
      <h3 style={{ marginTop: 0 }}>Create Assay Certificate</h3>
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          Export Document No (optional)
          <input name="exportDocumentNo" className="input" />
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
          }}
        >
          <label>
            Lots
            <input name="lots" type="number" min={0} className="input" />
          </label>
          <label>
            Fineness (%)
            <input
              name="finenessPercent"
              type="number"
              min={0}
              max={100}
              step={0.01}
              className="input"
            />
          </label>
          <label>
            Gross Weight (g)
            <input
              name="grossWeightGrams"
              type="number"
              min={0}
              step={0.01}
              required
              className="input"
            />
          </label>
          <label>
            Net Weight (g)
            <input
              name="netWeightGrams"
              type="number"
              min={0}
              step={0.01}
              required
              className="input"
            />
          </label>
          <label>
            Net Weight (oz)
            <input
              name="netWeightOz"
              type="number"
              min={0}
              step={0.001}
              required
              className="input"
            />
          </label>
        </div>
        <label>
          Customs Seal No
          <input name="customsSealNo" className="input" />
        </label>
        <label>
          PMMC Seal No
          <input name="pmmcSealNo" className="input" />
        </label>
        <label>
          Other Seal No
          <input name="otherSealNo" className="input" />
        </label>
        <label>
          Certificate No
          <input name="certificateNo" required className="input" />
        </label>
        <label>
          Date
          <input name="date" type="date" required className="input" />
        </label>
        <label>
          Client
          <input name="client" required className="input" />
        </label>
        <label>
          Reference
          <input name="reference" required className="input" />
        </label>
        <label>
          Exporter
          <input name="exporter" required className="input" />
        </label>
        <div>
          <button
            disabled={loading}
            className="btn-glass btn-inline"
            type="submit"
          >
            {loading ? "Submitting…" : "Create Certificate"}
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
