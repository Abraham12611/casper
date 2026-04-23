"use client";

import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { useCustomer } from "autumn-js/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
    Crosshair, 
    Phone, 
    CalendarBlank, 
    Buildings, 
    Plus, 
    GearSix, 
    SquaresFour, 
    Clock, 
    TrendUp,
    Sparkle,
    ChartLineUp,
    EnvelopeSimple
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CasperStatCard } from "@/components/ui/CasperStatCard";
import { CasperQuickAction } from "@/components/ui/CasperQuickAction";

// Type for call objects
type CallRecord = Doc<"calls">;

export default function DashboardPage() {
  return (
    <main className="min-h-full flex flex-col">
      <Unauthenticated>
        <RedirectToHome />
      </Unauthenticated>
      <Authenticated>
        <DashboardContent />
      </Authenticated>
    </main>
  );
}

function RedirectToHome() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}

function DashboardContent() {
  const user = useQuery(api.auth.getCurrentUser);
  const agencyProfile = useQuery(api.sellerBrain.getForCurrentUser);
  const router = useRouter();
  const { customer } = useCustomer();
  const onboardingStatus = useQuery(api.onboarding.queries.getOnboardingStatus, { onboardingFlowId: agencyProfile?.onboardingFlowId });
  
  // Query for recent data to show in overview
  const recentLeadGenJobs = useQuery(
    api.marketing.listLeadGenJobsByAgency,
    agencyProfile?.agencyProfileId ? { agencyId: agencyProfile.agencyProfileId } : "skip"
  );

  const recentCalls = useQuery(
    api.call.calls.getCallsByAgency,
    agencyProfile?.agencyProfileId ? { agencyId: agencyProfile.agencyProfileId } : "skip"
  );

  // Show loading state while data is being fetched
  const isLoading = user === undefined || agencyProfile === undefined || onboardingStatus === undefined;

  const casperCreditsBalance = customer?.features?.atlas_credits?.balance ?? 0;
  
  // Calculate quick stats
  const completedCampaigns = recentLeadGenJobs?.filter(job => job.status === "completed")?.length ?? 0;
  const readyOpportunities = recentLeadGenJobs?.reduce((sum, job) => {
    return sum + (job.numLeadsFetched || 0);
  }, 0) ?? 0;
  const completedCalls = recentCalls?.filter((call: CallRecord) => call.currentStatus === "completed" || call.status === "completed")?.length ?? 0;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[#1A1A1A] tracking-tight mb-2">
            Dashboard Overview
          </h1>
          <p className="text-[#6B6B6B] text-[15px]">
            Welcome back, <span className="text-[#1A1A1A] font-semibold">{user?.name || user?.email}</span>. Your agency system is ready to grow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] border border-[#E8E8E8] rounded-xl px-5 h-11 transition-all shadow-sm">
            <Link href="/dashboard/subscription" className="flex items-center gap-2">
              <GearSix className="w-4 h-4" />
              Credits Manager
            </Link>
          </Button>
          <Button asChild className="bg-[#1A1A1A] hover:bg-[#000000] text-white rounded-xl px-5 h-11 border-none transition-all hover:scale-[1.02]">
            <Link href="/dashboard/marketing" className="flex items-center gap-2 text-white">
              <Plus className="w-4 h-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CasperStatCard 
          title="Casper Credits" 
          value={casperCreditsBalance} 
          subtitle="Available for research & calls"
          accentColor="#9A9A9A"
          trend={0}
          data={[]}
          delay={1}
        />
        <CasperStatCard 
          title="Active Campaigns" 
          value={completedCampaigns} 
          subtitle="Successfully processed"
          accentColor="#9A9A9A"
          trend={completedCampaigns > 0 ? 100 : 0}
          data={recentLeadGenJobs?.map(j => ({ value: j.numLeadsFetched || 0 })) || []}
          delay={2}
        />
        <CasperStatCard 
          title="Qualified Leads" 
          value={readyOpportunities} 
          subtitle="Ready for outreach"
          accentColor="#9A9A9A"
          trend={readyOpportunities > 0 ? 100 : 0}
          data={recentLeadGenJobs?.map(j => ({ value: j.numLeadsFetched || 0 })) || []}
          delay={3}
        />
        <CasperStatCard 
          title="Calls Completed" 
          value={completedCalls} 
          subtitle="Total voice interactions"
          accentColor="#9A9A9A"
          trend={completedCalls > 0 ? 100 : 0}
          data={recentCalls?.map(c => ({ value: 1 })) || []}
          delay={4}
        />
      </div>

      {/* Main Grid: Operations & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-[18px] font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <SquaresFour size={18} className="text-[#1A1A1A]" />
              Agency Operations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CasperQuickAction 
                icon={<Crosshair size={24} />}
                title="Lead Generation"
                subtitle="Find and qualify new clients"
                href="/dashboard/marketing"
                highlight
                delay={1}
              />
              <CasperQuickAction 
                icon={<Phone size={24} />}
                title="AI Sales Calls"
                subtitle="Review your automated calls"
                href="/dashboard/calls"
                delay={2}
              />
              <CasperQuickAction 
                icon={<EnvelopeSimple size={24} />}
                title="Client Messages"
                subtitle="Track sent updates & emails"
                href="/dashboard/emails"
                delay={3}
              />
              <CasperQuickAction 
                icon={<Buildings size={24} />}
                title="Agency Profile"
                subtitle="Update your agency details"
                href="/dashboard/agency"
                delay={4}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity Mini-Feed */}
        <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden flex flex-col h-full">
             <div className="p-6 border-b border-[#EBEBEB] flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-[#1A1A1A]">Recent Activity</h3>
                <Link href="/dashboard/marketing" className="text-[13px] text-[#1A1A1A] font-semibold hover:underline">View all</Link>
             </div>
             <div className="divide-y divide-[#EBEBEB] overflow-y-auto max-h-[460px] hide-scrollbar">
                {recentLeadGenJobs?.slice(0, 5).map((job) => (
                    <Link 
                        key={job._id} 
                        href={`/dashboard/marketing/${job._id}`}
                        className="flex items-center gap-4 p-4 hover:bg-[#F5F5F5] transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-[#9A9A9A] group-hover:bg-[#1A1A1A]/5 group-hover:text-[#1A1A1A] transition-colors shrink-0">
                            <Sparkle size={18} weight="fill" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-[#1A1A1A] truncate">
                                {job.campaign.targetVertical} in {job.campaign.targetGeography}
                            </p>
                            <p className="text-[12px] text-[#6B6B6B]">{job.numLeadsFetched} leads fetched</p>
                        </div>
                        <StatusBadge status={job.status} />
                    </Link>
                ))}
                {(!recentLeadGenJobs || recentLeadGenJobs.length === 0) && (
                    <div className="p-8 text-center text-[#9A9A9A] text-[14px]">
                        No recent activity found.
                    </div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getColors = (s: string) => {
    switch (s.toLowerCase()) {
      case "completed": return "bg-[#E8F5E9] text-[#2E7D32] border-[#E8F5E9]";
      case "running": return "bg-[#FFF3E0] text-[#E65100] border-[#FFF3E0]";
      case "error": case "failed": return "bg-[#FDECEA] text-[#C62828] border-[#FDECEA]";
      default: return "bg-[#F5F5F5] text-[#6B6B6B] border-[#F5F5F5]";
    }
  };

  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getColors(status)}`}>
      {status}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-[#E8E8E8]" />
          <Skeleton className="h-5 w-96 bg-[#E8E8E8]" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-32 bg-[#E8E8E8] rounded-xl" />
          <Skeleton className="h-11 w-40 bg-[#E8E8E8] rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 bg-white border border-[#E8E8E8] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 bg-white border border-[#E8E8E8] rounded-xl" />
          ))}
        </div>
        <Skeleton className="bg-white border border-[#E8E8E8] rounded-xl" />
      </div>
    </div>
  );
}
