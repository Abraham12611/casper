"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { CasperSidebar } from "@/components/ui/CasperSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const isOnboarding = pathname === "/dashboard/onboarding";

  // Always call hooks unconditionally
  const agencyProfile = useQuery(api.sellerBrain.getForCurrentUser);

  // Redirect logic (System Activation)
  React.useEffect(() => {
    if (
      isOnboarding && 
      agencyProfile &&
      agencyProfile.tone &&
      agencyProfile.targetVertical &&
      agencyProfile.availability
    ) {
      router.replace("/dashboard");
    }
  }, [isOnboarding, agencyProfile, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#1e1e2c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#f97316]" />
          <p className="text-sm text-[#9ca3b4]">Loading Casper...</p>
        </div>
      </div>
    );
  }

  // For onboarding, render without sidebar
  if (isOnboarding) {
    const isLoading = agencyProfile === undefined;
    const shouldRedirect =
      agencyProfile &&
      agencyProfile.tone &&
      agencyProfile.targetVertical &&
      agencyProfile.availability;

    if (isLoading || shouldRedirect) {
      return (
        <div className="min-h-screen bg-[#1e1e2c] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#f97316]" />
            <p className="text-sm text-[#9ca3b4]">Syncing Casper...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#1e1e2c]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1e1e2c] text-[#f0f0f5] overflow-hidden">
      <CasperSidebar />
      <main className="flex-1 overflow-y-auto relative bg-[#1e1e2c]">
        {/* Subtle background glow for the main content area */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f97316]/5 blur-[120px] pointer-events-none" />
        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
