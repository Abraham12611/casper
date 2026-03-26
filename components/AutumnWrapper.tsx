"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useConvex } from "convex/react";
import { AutumnProvider } from "autumn-js/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

export function AutumnWrapper({ children }: { children: React.ReactNode }) {
  const { isLoaded: isAuthLoaded } = useAuth();
  const { isLoaded: isUserLoaded } = useUser();
  const convex = useConvex();

  // Type assertion for the inner autumn API
  const convexApi = (api as unknown as { autumn: unknown }).autumn as any;

  if (!isAuthLoaded || !isUserLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d0d12]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#52525e]">
            Initializing Matrix...
          </span>
        </div>
      </div>
    );
  }

  return (
    <AutumnProvider convex={convex} convexApi={convexApi}>
      {children}
    </AutumnProvider>
  );
}
