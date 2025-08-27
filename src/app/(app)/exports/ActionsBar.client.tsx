"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FileText, Plus, Download } from "lucide-react";
import { CreateExportForm } from "@/components/forms/CreateExportForm";
import { CreateAssayCertificateForm } from "@/components/forms/CreateAssayCertificateForm";

export function ExportsActionsBar({ total }: { total: number }) {
  const [openExport, setOpenExport] = useState(false);
  const [openAssay, setOpenAssay] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <div
        className="glass"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 12,
        }}
      >
        <FileText size={18} />
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontWeight: 600, lineHeight: 1 }}>Exports</div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              lineHeight: 1,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18 }}>{total}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              Total
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          variant="glass"
          title="Export CSV"
          aria-label="Export CSV"
          leftIcon={<Download size={16} />}
          onClick={() => {
            /* optional */
          }}
        />
        <Button
          variant="primary"
          title="Add Export"
          aria-label="Add Export"
          leftIcon={<Plus size={16} />}
          onClick={() => setOpenExport(true)}
        />
        <Button
          variant="secondary"
          title="Add Assay Certificate"
          aria-label="Add Assay Certificate"
          leftIcon={<Plus size={16} />}
          onClick={() => setOpenAssay(true)}
        />
      </div>
      {(openExport || openAssay) && (
        <div role="dialog" aria-modal="true" className="modal-overlay">
          <div
            className="glass"
            style={{ width: "min(820px, 96vw)", padding: 16, borderRadius: 12 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <strong>
                {openExport ? "New Export" : "New Assay Certificate"}
              </strong>
              <button
                aria-label="Close"
                onClick={() => {
                  setOpenExport(false);
                  setOpenAssay(false);
                }}
                style={{
                  border:
                    "1px solid color-mix(in oklab, var(--danger), black 18%)",
                  background: "var(--danger)",
                  color: "#fff",
                  padding: 6,
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
            {openExport ? <CreateExportForm /> : <CreateAssayCertificateForm />}
          </div>
        </div>
      )}
    </div>
  );
}
