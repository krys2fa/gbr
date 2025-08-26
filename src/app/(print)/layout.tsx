import type { ReactNode } from "react";

export default function PrintLayout({ children }: { children: ReactNode }) {
  const styles = `
        @page {
          size: A4;
          margin: 16mm;
        }
        body {
          background: #fff;
          color: #000;
        }
        .no-print {
          display: block;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          a {
            text-decoration: none;
            color: inherit;
          }
        }
        .sheet {
          max-width: 800px;
          margin: 0 auto;
          padding: 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
        }
        .sheet h1,
        .sheet h2,
        .sheet h3 {
          margin: 0 0 8px;
        }
        .sheet .row {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 8px;
        }
        .muted {
          color: #555;
        }
        hr {
          border: none;
          border-top: 1px solid #eee;
          margin: 12px 0;
        }
      `;
  return (
    <div>
      {children}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
    </div>
  );
}
