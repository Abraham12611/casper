"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SpinnerGap } from "@phosphor-icons/react";
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
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SpinnerGap className="h-8 w-8 animate-spin text-[#1A1A1A]" weight="bold" />
          <p className="text-sm text-[#6B6B6B]">Loading Casper...</p>
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
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <SpinnerGap className="h-8 w-8 animate-spin text-[#1A1A1A]" weight="bold" />
            <p className="text-sm text-[#6B6B6B]">Loading Casper...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F5F5] text-[#1A1A1A] overflow-hidden">
      <CasperSidebar />
      <main className="flex-1 overflow-y-auto relative bg-[#F5F5F5]">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
