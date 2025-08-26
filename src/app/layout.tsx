import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "GoldBod Registry",
  description: "Evaluate gold and process payments for sales and exports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} antialiased`}>
        <header
          style={{ padding: "12px 16px", borderBottom: "1px solid #eee" }}
        >
          <strong>GoldBod Registry</strong>
        </header>
        <main style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
