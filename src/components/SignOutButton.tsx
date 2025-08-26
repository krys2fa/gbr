"use client";
import { signOut } from "next-auth/react";

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
      style={{
        padding: "8px 12px",
        border: "1px solid #ddd",
        background: "#fff",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
