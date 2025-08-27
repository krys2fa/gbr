import { prisma } from "@/server/db";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function SealPrintPage({
  params,
}: {
  params: { id: string };
}) {
  const seal = await (prisma as any).seal.findUnique({
    where: { id: params.id },
    include: { jobCard: true },
  });
  if (!seal)
    return (
      <div className="sheet">
        <h1>Seal Sheet</h1>
        <p className="muted">Not found.</p>
      </div>
    );
  return (
    <div className="sheet">
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Link href="/seals">Back</Link>
        <Button variant="glass" onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Image
          src="/goldbod-logo.webp"
          alt="GoldBod"
          width={28}
          height={28}
          style={{ borderRadius: 6 }}
        />
        <h1 style={{ margin: 0 }}>Seal Sheet</h1>
      </div>
      <p className="muted">Seal ID: {seal.id}</p>
      <hr />
      <div className="row">
        <strong>Customs Name</strong>
        <div>{seal.customsName}</div>
      </div>
      <div className="row">
        <strong>Customs Number</strong>
        <div>{seal.customsNumber}</div>
      </div>
      <div className="row">
        <strong>Security Seal Numbers</strong>
        <div>{seal.securitySealNumbers}</div>
      </div>
      <div className="row">
        <strong>PMMC Seal No</strong>
        <div>{seal.pmmcSealNo}</div>
      </div>
      <div className="row">
        <strong>Assay Certificate #</strong>
        <div>{seal.assayCertificateNumber}</div>
      </div>
      <div className="row">
        <strong>Date</strong>
        <div>{new Date(seal.createdAt).toLocaleString()}</div>
      </div>
      <hr />
      <h3>Job Card</h3>
      <div className="row">
        <strong>Reference</strong>
        <div>{seal.jobCard?.ref}</div>
      </div>
      <div className="row">
        <strong>Buyer</strong>
        <div>{seal.jobCard?.buyerName}</div>
      </div>
      <div className="row">
        <strong>Destination</strong>
        <div>{seal.jobCard?.destinationCountry}</div>
      </div>
    </div>
  );
}
