"use client";
import { useState } from "react";

export function CreateJobCardForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/job-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref: payload.ref,
          exporterType: payload.exporterType || "GOLDBOD",
          exporterName: payload.exporterName || "GOLDBOD",
          buyerName: payload.buyerName,
          phone: payload.phone,
          address: payload.address,
          tinNumber: payload.tinNumber,
          destinationCountry: payload.destinationCountry,
          deliveryLocation: payload.deliveryLocation,
          consignee: payload.consignee,
          notifiedParty: payload.notifiedParty,
          numberOfBoxes: Number(payload.numberOfBoxes || 1),
          airwayBill: payload.airwayBill,
          countryOfOrigin: payload.countryOfOrigin || "Ghana",
          exporterReference: payload.exporterReference,
          usdPrice: String(payload.usdPrice || "0"),
          totalWeight: String(payload.totalWeight || "0"),
          purityPercent: String(payload.purityPercent || "0"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create job card");
      e.currentTarget.reset();
      window.location.href = "/evaluations";
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
          Ref
          <input name="ref" className="input" required />
        </label>
        <label>
          Buyer
          <input name="buyerName" className="input" required />
        </label>
        <label>
          Phone
          <input name="phone" className="input" required />
        </label>
        <label>
          Address
          <input name="address" className="input" required />
        </label>
        <label>
          TIN
          <input name="tinNumber" className="input" required />
        </label>
        <label>
          Destination
          <input
            name="destinationCountry"
            className="input"
            required
            defaultValue="UAE"
          />
        </label>
        <label>
          Delivery Loc
          <input name="deliveryLocation" className="input" required />
        </label>
        <label>
          Consignee
          <input name="consignee" className="input" required />
        </label>
        <label>
          Notified Party
          <input name="notifiedParty" className="input" required />
        </label>
        <label>
          Boxes
          <input
            type="number"
            name="numberOfBoxes"
            className="input"
            min={1}
            defaultValue={1}
          />
        </label>
        <label>
          Airway Bill
          <input name="airwayBill" className="input" required />
        </label>
        <label>
          Exporter Ref
          <input name="exporterReference" className="input" required />
        </label>
        <label>
          USD Price
          <input name="usdPrice" className="input" />
        </label>
        <label>
          Total Weight (g)
          <input name="totalWeight" className="input" />
        </label>
        <label>
          Purity %<input name="purityPercent" className="input" />
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
          {loading ? "Saving..." : "Create Job Card"}
        </button>
        {/* Import section */}
        <label className="btn-glass btn-inline" style={{ cursor: "pointer" }}>
          Import XLSX/CSV
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.currentTarget.files?.[0];
              if (!file) return;
              setError(null);
              setImporting(true);
              try {
                // Lazy import to keep bundle slim
                const XLSX = await import("xlsx");
                const data = await file.arrayBuffer();
                let rows: any[] = [];
                if (file.name.toLowerCase().endsWith(".csv")) {
                  const text = new TextDecoder().decode(new Uint8Array(data));
                  // Simple CSV parse using XLSX as well
                  const wb = XLSX.read(text, { type: "string" });
                  const ws = wb.Sheets[wb.SheetNames[0]];
                  rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
                } else {
                  const wb = XLSX.read(data, { type: "array" });
                  const ws = wb.Sheets[wb.SheetNames[0]];
                  rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
                }
                // Map common headers to expected fields
                const mapped = rows.map((r) => ({
                  ref: r.ref || r.Ref || r.reference || r.Reference,
                  exporterType:
                    r.exporterType ||
                    r.ExporterType ||
                    r.exporter_type ||
                    "GOLDBOD",
                  exporterName:
                    r.exporterName ||
                    r.ExporterName ||
                    r.exporter_name ||
                    "GOLDBOD",
                  buyerName: r.buyerName || r.Buyer || r.buyer || r.BuyerName,
                  phone: r.phone || r.Phone,
                  address: r.address || r.Address,
                  tinNumber: r.tinNumber || r.TIN || r.tin || r.tin_number,
                  destinationCountry:
                    r.destinationCountry ||
                    r.destination ||
                    r.Destination ||
                    r.country,
                  deliveryLocation:
                    r.deliveryLocation || r.Delivery || r.delivery_location,
                  consignee: r.consignee || r.Consignee,
                  notifiedParty:
                    r.notifiedParty || r.Notified || r.notified_party,
                  numberOfBoxes:
                    r.numberOfBoxes ||
                    r.Boxes ||
                    r.boxes ||
                    r.number_of_boxes ||
                    1,
                  airwayBill: r.airwayBill || r.AWB || r.awb || r.airway_bill,
                  countryOfOrigin:
                    r.countryOfOrigin || r.origin || r.Origin || "Ghana",
                  exporterReference:
                    r.exporterReference || r.ExporterRef || r.exporter_ref,
                  usdPrice: r.usdPrice || r.price || r.Price || 0,
                  totalWeight: r.totalWeight || r.weight || r.Weight || 0,
                  purityPercent: r.purityPercent || r.purity || r.Purity || 0,
                }));
                // Basic validation: keep only rows with minimal required fields
                const cleaned = mapped.filter(
                  (m) =>
                    m &&
                    m.ref &&
                    m.buyerName &&
                    m.phone &&
                    m.address &&
                    m.tinNumber &&
                    m.destinationCountry &&
                    m.deliveryLocation &&
                    m.consignee &&
                    m.notifiedParty &&
                    m.airwayBill &&
                    m.exporterReference
                );
                if (cleaned.length === 0) {
                  throw new Error("No valid rows detected in the file");
                }
                const res = await fetch("/api/job-cards/import", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ rows: cleaned }),
                });
                const j = await res.json();
                if (!res.ok) throw new Error(j.error || "Import failed");
                alert(`Imported ${j.count} rows`);
                // optional: redirect to list
              } catch (err: any) {
                setError(err.message || "Failed to import");
              } finally {
                setImporting(false);
                e.currentTarget.value = "";
              }
            }}
          />
        </label>
        {importing && <span>Parsing & uploading…</span>}
        {error && <span style={{ color: "#f66" }}>{error}</span>}
      </div>
      <div className="glass" style={{ marginTop: 12, padding: 12 }}>
        <strong>Import format</strong>
        <p className="muted" style={{ margin: 0 }}>
          Upload a CSV or Excel file with these headers (first sheet is used):
        </p>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <code style={{ fontSize: 12 }}>
            ref, exporterType, exporterName, buyerName, phone, address,
            tinNumber, destinationCountry, deliveryLocation, consignee,
            notifiedParty, numberOfBoxes, airwayBill, countryOfOrigin,
            exporterReference, usdPrice, totalWeight, purityPercent
          </code>
        </div>
        <div style={{ marginTop: 8 }}>
          <a
            className="btn-glass btn-inline"
            href="/job-cards-import-template.csv"
            download
          >
            Download template
          </a>
        </div>
      </div>
    </form>
  );
}
