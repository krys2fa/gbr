"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          richColors
          position="top-right"
          closeButton
          toastOptions={{ classNames: { toast: "glass sonner-toast" } }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
