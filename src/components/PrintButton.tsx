"use client";
import { Button } from "@/components/ui/Button";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <Button variant="glass" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
