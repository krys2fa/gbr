"use client";
import { useState } from "react";

export function CreateExportForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      caseRef: String(fd.get("caseRef") || ""),
      documentNo: String(fd.get("documentNo") || ""),
      destination: String(fd.get("destination") || ""),
    };
    try {
      setLoading(true);
      const res = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setMsg(`Created export: ${json.export?.documentNo ?? ""}`);
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
      <h3 style={{ marginTop: 0 }}>Create Export</h3>
      <div style={{ display: "grid", gap: 8 }}>
        <label>
          Case Ref
          <input name="caseRef" required className="input" />
        </label>
        <label>
          Document No
          <input name="documentNo" required className="input" />
        </label>
        <label>
          Destination
          <input name="destination" required className="input" />
        </label>
        <div>
          <button
            disabled={loading}
            className="btn-glass btn-inline"
            type="submit"
          >
            {loading ? "Submitting…" : "Create Export"}
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
