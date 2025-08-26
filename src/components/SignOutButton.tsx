"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton({
  label = "Sign out",
  callbackUrl = "/signin",
}: {
  label?: string;
  callbackUrl?: string;
}) {
  return (
    <button
      onClick={() => signOut({ callbackUrl })}
      className="glass-press btn-inline btn-glass"
      aria-label={label}
    >
      <LogOut size={16} />
      <span>{label}</span>
    </button>
  );
}
