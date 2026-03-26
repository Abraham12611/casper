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
    Target, 
    Phone, 
    Calendar, 
    Building2, 
    Plus, 
    Settings, 
    LayoutGrid, 
    Clock, 
    TrendingUp,
    Sparkles,
    Activity,
    Mail
} from "lucide-react";
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
          <h1 className="text-[32px] font-bold text-[#f0f0f5] tracking-tight mb-2">
            Dashboard Overview
          </h1>
          <p className="text-[#9ca3b4] text-[15px]">
            Welcome back, <span className="text-[#f0f0f5] font-semibold">{user?.name || user?.email}</span>. Your agency system is ready to grow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="bg-[#26263a] hover:bg-[#2a2a3c] text-[#f0f0f5] border border-[#2a2a3c] rounded-xl px-5 h-11 transition-all shadow-sm">
            <Link href="/dashboard/subscription" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Credits Manager
            </Link>
          </Button>
          <Button asChild className="bg-[#f97316] hover:bg-[#ea580c] text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.3)] rounded-xl px-5 h-11 border-none transition-all hover:scale-[1.02]">
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
          accentColor="#f97316"
          trend={0}
          data={[]}
          delay={1}
        />
        <CasperStatCard 
          title="Active Campaigns" 
          value={completedCampaigns} 
          subtitle="Successfully processed"
          accentColor="#3b82f6"
          trend={completedCampaigns > 0 ? 100 : 0}
          data={recentLeadGenJobs?.map(j => ({ value: j.numLeadsFetched || 0 })) || []}
          delay={2}
        />
        <CasperStatCard 
          title="Qualified Leads" 
          value={readyOpportunities} 
          subtitle="Ready for outreach"
          accentColor="#22c55e"
          trend={readyOpportunities > 0 ? 100 : 0}
          data={recentLeadGenJobs?.map(j => ({ value: j.numLeadsFetched || 0 })) || []}
          delay={3}
        />
        <CasperStatCard 
          title="Calls Completed" 
          value={completedCalls} 
          subtitle="Total voice interactions"
          accentColor="#7b61ff"
          trend={completedCalls > 0 ? 100 : 0}
          data={recentCalls?.map(c => ({ value: 1 })) || []}
          delay={4}
        />
      </div>

      {/* Main Grid: Protocols & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-[18px] font-bold text-[#f0f0f5] mb-6 flex items-center gap-2">
              <LayoutGrid size={18} className="text-[#f97316]" />
              Agency Operations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CasperQuickAction 
                icon={<Target size={24} />}
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
                icon={<Mail size={24} />}
                title="Client Messages"
                subtitle="Track sent updates & emails"
                href="/dashboard/emails"
                delay={3}
              />
              <CasperQuickAction 
                icon={<Building2 size={24} />}
                title="Agency Profile"
                subtitle="Update your agency details"
                href="/dashboard/agency"
                delay={4}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity Mini-Feed */}
        <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px] overflow-hidden flex flex-col h-full ring-1 ring-white/5 shadow-premium">
             <div className="p-6 border-b border-[#2a2a3c] flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-[16px] font-bold text-[#f0f0f5]">Recent Activity</h3>
                <Link href="/dashboard/marketing" className="text-[13px] text-[#f97316] font-semibold hover:underline">View all</Link>
             </div>
             <div className="divide-y divide-[#2a2a3c] overflow-y-auto max-h-[460px] hide-scrollbar">
                {recentLeadGenJobs?.slice(0, 5).map((job) => (
                    <Link 
                        key={job._id} 
                        href={`/dashboard/marketing/${job._id}`}
                        className="flex items-center gap-4 p-4 hover:bg-[#26263a] transition-colors group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-[#22222e] flex items-center justify-center text-[#9ca3b4] group-hover:bg-[#f97316]/10 group-hover:text-[#f97316] transition-colors shrink-0">
                            <Sparkles size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-[#f0f0f5] truncate">
                                {job.campaign.targetVertical} in {job.campaign.targetGeography}
                            </p>
                            <p className="text-[12px] text-[#6b7280]">{job.numLeadsFetched} leads fetched</p>
                        </div>
                        <StatusBadge status={job.status} />
                    </Link>
                ))}
                {(!recentLeadGenJobs || recentLeadGenJobs.length === 0) && (
                    <div className="p-8 text-center text-[#6b7280] text-[14px]">
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
      case "completed": return "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20";
      case "running": return "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20";
      case "error": case "failed": return "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20";
      default: return "bg-[#6b7280]/10 text-[#6b7280] border-[#6b7280]/20";
    }
  };

  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getColors(status)} uppercase tracking-wider`}>
      {status}
    </span>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-[#26263a]" />
          <Skeleton className="h-5 w-96 bg-[#26263a]" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-32 bg-[#26263a] rounded-xl" />
          <Skeleton className="h-11 w-40 bg-[#26263a] rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 bg-[#1e1e2c] border border-[#2a2a3c] rounded-[16px]" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 bg-[#1e1e2c] border border-[#2a2a3c] rounded-[20px]" />
          ))}
        </div>
        <Skeleton className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px]" />
      </div>
    </div>
  );
}
