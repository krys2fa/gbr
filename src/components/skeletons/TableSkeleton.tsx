"use client";
import React from "react";

export function TableSkeleton({
  rows = 8,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  const cols = Array.from({ length: columns });
  const rws = Array.from({ length: rows });
  return (
    <div
      className="glass glass-table"
      style={{ padding: 12, borderRadius: 12 }}
    >
      <div style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {cols.map((_, i) => (
                <th key={i} align={i === 1 ? "right" : "left"}>
                  <div className="skl" style={{ width: 120, height: 12 }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rws.map((_, r) => (
              <tr key={r}>
                {cols.map((__, c) => (
                  <td key={c}>
                    <div
                      className="skl"
                      style={{ width: c === 0 ? 180 : 120, height: 12 }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .skl {
          display: inline-block;
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            color-mix(in oklab, var(--cardBg, #111), white 12%),
            color-mix(in oklab, var(--cardBg, #111), white 22%),
            color-mix(in oklab, var(--cardBg, #111), white 12%)
          );
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
            opacity: 0.85;
          }
          100% {
            background-position: 0 0;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export function HeaderSkeleton() {
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
        <div
          className="skl"
          style={{ width: 20, height: 20, borderRadius: 6 }}
        />
        <div style={{ display: "grid", gap: 4 }}>
          <div className="skl" style={{ width: 80, height: 12 }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <div className="skl" style={{ width: 40, height: 16 }} />
            <div className="skl" style={{ width: 36, height: 10 }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div
          className="skl"
          style={{ width: 90, height: 34, borderRadius: 10 }}
        />
        <div
          className="skl"
          style={{ width: 110, height: 34, borderRadius: 10 }}
        />
      </div>
      <style jsx>{`
        .skl {
          display: inline-block;
          border-radius: 6px;
          background: linear-gradient(
            90deg,
            color-mix(in oklab, var(--cardBg, #111), white 12%),
            color-mix(in oklab, var(--cardBg, #111), white 22%),
            color-mix(in oklab, var(--cardBg, #111), white 12%)
          );
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
            opacity: 0.85;
          }
          100% {
            background-position: 0 0;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
