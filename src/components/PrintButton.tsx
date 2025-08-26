"use client";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="btn-glass btn-inline">
      {label}
    </button>
  );
}
