"use client";

import { useQuery, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCustomer } from "autumn-js/react";
import Link from "next/link";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { 
    Crosshair, 
    Sparkle, 
    ChartLineUp, 
    TrendUp, 
    Plus, 
    Clock, 
    MagnifyingGlass, 
    Funnel,
    ArrowUpRight,
    MapPin,
    Lightning,
    CheckCircle,
    WarningCircle,
    PlayCircle,
    SpinnerGap
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CasperStatCard } from "@/components/ui/CasperStatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TARGET_VERTICALS = [
  "Roofing", "Plumbing", "Electricians", "HVAC", "Landscaping & Lawn Care",
  "Tree Services", "Pest Control", "Garage Door Services", "Solar Installers",
  "General Contractors & Remodeling", "Painting", "Cleaning Services",
  "Restoration (Water/Fire/Mold)", "Window Cleaning", "Pressure Washing",
  "Handyman", "Auto Repair", "Auto Body & Collision", "Tire Shops",
  "Dentists", "Chiropractors", "Physical Therapy", "Optometrists",
  "Med Spas", "Hair Salons & Barbers", "Law Firms", "Accountants & CPAs",
  "Real Estate Agents", "Property Management", "Mortgage Brokers"
];

export default function MarketingPage() {
  const router = useRouter();
  const agencyProfile = useQuery(api.sellerBrain.getForCurrentUser);
  const { customer } = useCustomer();
  const startLeadGenWorkflow = useAction(api.marketing.startLeadGenWorkflow);

  // State for lead generation form
  const [numLeads, setNumLeads] = useState(10);
  const [targetVertical, setTargetVertical] = useState("");
  const [targetGeography, setTargetGeography] = useState("");
  const [isStartingWorkflow, setIsStartingWorkflow] = useState(false);

  // Prefill form fields from agency profile when it loads
  useEffect(() => {
    if (agencyProfile) {
      if (agencyProfile.targetVertical && !targetVertical) {
        setTargetVertical(agencyProfile.targetVertical);
      }
      if (agencyProfile.targetGeography && !targetGeography) {
        setTargetGeography(agencyProfile.targetGeography);
      }
    }
  }, [agencyProfile, targetVertical, targetGeography]);

  // Query for lead gen jobs
  const leadGenJobs = useQuery(
    api.marketing.listLeadGenJobsByAgency,
    agencyProfile?.agencyProfileId ? { agencyId: agencyProfile.agencyProfileId } : "skip"
  );

  const casperCreditsBalance = customer?.features?.atlas_credits?.balance ?? 0;

  const handleStartLeadGen = async () => {
    if (!agencyProfile?.agencyProfileId) return;
    
    setIsStartingWorkflow(true);
    try {
      const result = await startLeadGenWorkflow({
        numLeads,
        targetVertical: targetVertical || undefined,
        targetGeography: targetGeography || undefined,
      });
      router.push(`/dashboard/marketing/${result.jobId}`);
    } catch (err) {
      console.error("Failed to start lead generation:", err);
    } finally {
      setIsStartingWorkflow(false);
    }
  };

  // Group jobs by status
  const runningJobs = leadGenJobs?.filter(job => job.status === "running") ?? [];
  const completedJobs = leadGenJobs?.filter(job => job.status === "completed") ?? [];
  const totalLeadsDiscovered = leadGenJobs?.reduce((sum, job) => sum + (job.numLeadsFetched || 0), 0) ?? 0;

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
            Lead Generation
          </h1>
          <p className="text-[#6B6B6B] text-[15px]">
            Your automated prospecting and Casper lead generation systems are <span className="text-[#2E7D32] font-medium">active</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end px-4 py-2 bg-white border border-[#E8E8E8] rounded-xl">
             <span className="text-[10px] font-semibold text-[#9A9A9A]">Available Credits</span>
             <span className="text-[18px] font-bold text-[#1A1A1A]">{casperCreditsBalance}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CasperStatCard 
          title="Active Campaigns" 
          value={runningJobs.length} 
          subtitle="Currently finding leads"
          accentColor="#9A9A9A"
          trend={0}
          data={[]}
          delay={1}
        />
        <CasperStatCard 
          title="Total Discovered" 
          value={totalLeadsDiscovered} 
          subtitle="Qualified prospects found"
          accentColor="#9A9A9A"
          trend={0}
          data={[]}
          delay={2}
        />
        <CasperStatCard 
          title="Campaign Success" 
          value={leadGenJobs?.length ? Math.round((completedJobs.length / leadGenJobs.length) * 100) : 0} 
          subtitle="Completion rate"
          accentColor="#9A9A9A"
          trend={0}
          data={[]}
          delay={3}
        />
        <CasperStatCard 
          title="Casper Status" 
          value={runningJobs.length > 0 ? "Active" : "Ready"} 
          subtitle="System availability"
          accentColor="#9A9A9A"
          delay={4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Suite */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-[#1A1A1A]">
                        <Lightning size={20} />
                    </div>
                    <h3 className="text-[18px] font-bold text-[#1A1A1A]">New Campaign</h3>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-[#6B6B6B] ml-1">Volume</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={numLeads}
                                onChange={(e) => setNumLeads(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-full bg-[#F5F5F5] border border-[#E2E2E2] rounded-xl px-4 py-3 text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-[#9A9A9A]">leads</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-[#6B6B6B] ml-1">Industry / Vertical</label>
                        <Select value={targetVertical} onValueChange={setTargetVertical}>
                            <SelectTrigger className="w-full h-[46px] bg-[#F5F5F5] border-[#E2E2E2] rounded-xl px-4 text-[#1A1A1A] focus:border-[#1A1A1A]">
                                <SelectValue placeholder="Select vertical..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-[#E8E8E8] text-[#1A1A1A]">
                                {TARGET_VERTICALS.map(v => (
                                    <SelectItem key={v} value={v} className="focus:bg-[#F5F5F5] cursor-pointer">
                                        {v}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-[#6B6B6B] ml-1">Target Location</label>
                        <div className="relative group">
                            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A] group-focus-within:text-[#1A1A1A] transition-colors" />
                            <input 
                                type="text"
                                placeholder="Geographic target..."
                                value={targetGeography}
                                onChange={(e) => setTargetGeography(e.target.value)}
                                className="w-full bg-[#F5F5F5] border border-[#E2E2E2] rounded-xl pl-11 pr-4 py-3 text-[14px] text-[#1A1A1A] placeholder:text-[#ADADAD] focus:outline-none focus:border-[#1A1A1A] transition-all"
                            />
                        </div>
                    </div>

                    <Button 
                        onClick={handleStartLeadGen}
                        disabled={isStartingWorkflow || !agencyProfile?.agencyProfileId}
                        className="w-full bg-[#1A1A1A] hover:bg-[#000000] text-white font-semibold py-6 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isStartingWorkflow ? (
                            <SpinnerGap className="animate-spin h-5 w-5" />
                        ) : (
                            <>
                                <ChartLineUp size={18} className="mr-2" />
                                Start Search Campaign
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* System Log Mini */}
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
                <h4 className="text-[12px] font-semibold text-[#9A9A9A] mb-4">Latest Research Activity</h4>
                <div className="space-y-1">
                    <p className="text-[13px] text-[#1A1A1A] leading-tight">
                        {leadGenJobs?.[0]?.lastEvent?.message || "Waiting for campaign start..."}
                    </p>
                    <p className="text-[10px] text-[#9A9A9A]">{leadGenJobs?.[0]?._creationTime ? new Date(leadGenJobs[0]._creationTime).toLocaleTimeString() : "--:--:--"}</p>
                </div>
            </div>
        </div>

        {/* Right: Active & Historical Operations */}
        <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[18px] font-bold text-[#1A1A1A]">Campaign History</h3>
                <div className="flex gap-2">
                    <div className="relative">
                        <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A]" />
                        <input 
                            placeholder="Filter campaigns..."
                            className="bg-white border border-[#E2E2E2] rounded-lg pl-9 pr-3 py-1.5 text-[12px] text-[#1A1A1A] placeholder:text-[#ADADAD] focus:outline-none focus:border-[#1A1A1A] transition-all w-[180px]"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {leadGenJobs?.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white border border-[#E8E8E8] rounded-xl p-12 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                                <Sparkle size={32} className="text-[#9A9A9A]" />
                            </div>
                            <h4 className="text-[18px] font-bold text-[#1A1A1A] mb-2">No active campaigns</h4>
                            <p className="text-[#6B6B6B] max-w-sm mx-auto">Launch a lead generation campaign to see your results here.</p>
                        </motion.div>
                    ) : (
                        leadGenJobs?.map((job, idx) => (
                            <OperationCard key={job._id} job={job} delay={idx * 0.1} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
}

function OperationCard({ job, delay }: { job: any, delay: number }) {
  const isRunning = job.status === "running";
  const progress = Math.round((job.numLeadsFetched / job.numLeadsRequested) * 100);

  return (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="group relative bg-white border border-[#E8E8E8] rounded-xl p-5 hover:border-[#CCCCCC] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all cursor-pointer overflow-hidden"
    >
        <Link href={`/dashboard/marketing/${job._id}`} className="flex items-center gap-6 relative z-10">
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                isRunning ? "bg-[#FFF3E0] text-[#E65100]" : "bg-[#F5F5F5] text-[#9A9A9A]"
            )}>
                {isRunning ? <div className="relative"><ChartLineUp size={24} /><div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E65100] rounded-full border-2 border-white animate-pulse" /></div> : <CheckCircle size={24} weight="fill" className="text-[#2E7D32]" />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-[16px] font-semibold text-[#1A1A1A] truncate tracking-tight">{job.campaign.targetVertical}</h4>
                    <span className="text-[11px] text-[#6B6B6B] px-2 py-0.5 rounded-full bg-[#F5F5F5]">{job.campaign.targetGeography}</span>
                </div>
                <div className="flex items-center gap-4 text-[13px] text-[#6B6B6B]">
                    <div className="flex items-center gap-1.5">
                        <Crosshair size={14} className="opacity-60" />
                        <span>{job.numLeadsFetched} / {job.numLeadsRequested} Found</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="opacity-60" />
                        <span>{new Date(job._creationTime).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="w-[120px] space-y-2 text-right">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-semibold text-[#9A9A9A]">Progress</span>
                    <span className="text-[12px] font-semibold text-[#1A1A1A]">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={cn(
                            "h-full rounded-full",
                            isRunning ? "bg-[#1A1A1A]" : "bg-[#9A9A9A]"
                        )}
                    />
                </div>
                <div className="flex items-center justify-end gap-1.5 pt-1 text-[#9A9A9A] group-hover:text-[#1A1A1A] transition-colors">
                    <span className="text-[11px] font-semibold">Details</span>
                    <ArrowUpRight size={12} />
                </div>
            </div>
        </Link>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12">
      <div className="flex justify-between items-end">
        <Skeleton className="h-10 w-64 bg-[#E8E8E8]" />
        <Skeleton className="h-11 w-48 bg-[#E8E8E8] rounded-xl" />
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 bg-white border border-[#E8E8E8] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-12 gap-8">
        <Skeleton className="col-span-4 h-[500px] bg-white border border-[#E8E8E8] rounded-xl" />
        <div className="col-span-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 bg-white border border-[#E8E8E8] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
