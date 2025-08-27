"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { notify } from "@/lib/notify";

export function RouteToaster({
  signedIn,
  userName,
}: {
  signedIn?: boolean;
  userName?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (signedIn) {
      notify.success(
        "Signed in",
        userName ? `Welcome back, ${userName}.` : "Welcome back."
      );
      // Clean the URL by removing query params
      router.replace(pathname as any);
    }
  }, [signedIn, pathname, router, userName]);
  return null;
}
