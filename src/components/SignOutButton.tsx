"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { notify } from "@/lib/notify";
import { Button } from "@/components/ui/Button";

export function SignOutButton({
  label = "Sign out",
  callbackUrl = "/signin",
}: {
  label?: string;
  callbackUrl?: string;
}) {
  return (
    <Button
      variant="glass"
      size="sm"
      onClick={() => {
        notify.info("Signing out…");
        signOut({ callbackUrl });
      }}
      aria-label={label}
      leftIcon={<LogOut size={16} />}
    >
      {label}
    </Button>
  );
}
