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
    Target, 
    Sparkles, 
    Activity, 
    TrendingUp, 
    Plus, 
    Clock, 
    Search, 
    Filter,
    ArrowUpRight,
    MapPin,
    Zap,
    CheckCircle2,
    AlertCircle,
    PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CasperStatCard } from "@/components/ui/CasperStatCard";
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
          <h1 className="text-[32px] font-bold text-[#f0f0f5] tracking-tight mb-2">
            Lead Generation
          </h1>
          <p className="text-[#9ca3b4] text-[15px]">
            Your automated prospecting and Casper lead generation systems are <span className="text-[#22c55e] font-medium">active</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end px-4 py-2 bg-[#26263a]/50 border border-[#2a2a3c] rounded-xl">
             <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">Available Credits</span>
             <span className="text-[18px] font-mono font-bold text-[#f97316]">{casperCreditsBalance}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CasperStatCard 
          title="Active Campaigns" 
          value={runningJobs.length} 
          subtitle="Currently finding leads"
          accentColor="#f97316"
          trend={0}
          data={[]}
          delay={1}
        />
        <CasperStatCard 
          title="Total Discovered" 
          value={totalLeadsDiscovered} 
          subtitle="Qualified prospects found"
          accentColor="#3b82f6"
          trend={0}
          data={[]}
          delay={2}
        />
        <CasperStatCard 
          title="Campaign Success" 
          value={leadGenJobs?.length ? Math.round((completedJobs.length / leadGenJobs.length) * 100) : 0} 
          suffix="%"
          subtitle="Completion rate"
          accentColor="#22c55e"
          trend={0}
          data={[]}
          delay={3}
        />
        <CasperStatCard 
          title="Casper Status" 
          value={runningJobs.length > 0 ? "Active" : "Ready"} 
          subtitle="System availability"
          accentColor="#7b61ff"
          delay={4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Suite */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px] p-6 shadow-premium ring-1 ring-white/5">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-[#f97316]/10 flex items-center justify-center text-[#f97316]">
                        <Zap size={20} />
                    </div>
                    <h3 className="text-[18px] font-bold text-[#f0f0f5]">New Campaign</h3>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider ml-1">Volume</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={numLeads}
                                onChange={(e) => setNumLeads(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-full bg-[#161621] border border-[#2e2e40] rounded-xl px-4 py-3 text-[14px] text-[#f0f0f5] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all font-mono"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-mono text-[#52525e]">LEADS</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider ml-1">Industry / Vertical</label>
                        <Select value={targetVertical} onValueChange={setTargetVertical}>
                            <SelectTrigger className="w-full h-[46px] bg-[#161621] border-[#2e2e40] rounded-xl px-4 text-[#f0f0f5] focus:ring-[#f97316]/30">
                                <SelectValue placeholder="Select vertical..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a26] border-[#2a2a3c] text-[#f0f0f5]">
                                {TARGET_VERTICALS.map(v => (
                                    <SelectItem key={v} value={v} className="focus:bg-[#26263a] focus:text-white cursor-pointer">
                                        {v}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider ml-1">Target Location</label>
                        <div className="relative group">
                            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525e] group-focus-within:text-[#f97316] transition-colors" />
                            <input 
                                type="text"
                                placeholder="Geographic target..."
                                value={targetGeography}
                                onChange={(e) => setTargetGeography(e.target.value)}
                                className="w-full bg-[#161621] border border-[#2e2e40] rounded-xl pl-11 pr-4 py-3 text-[14px] text-[#f0f0f5] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all"
                            />
                        </div>
                    </div>

                    <Button 
                        onClick={handleStartLeadGen}
                        disabled={isStartingWorkflow || !agencyProfile?.agencyProfileId}
                        className="w-full bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-bold py-6 rounded-xl shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isStartingWorkflow ? (
                            <Loader2 className="animate-spin h-5 w-5" />
                        ) : (
                            <>
                                <Activity size={18} className="mr-2" />
                                Start Search Campaign
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* System Log Mini */}
            <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px] p-6 shadow-premium ring-1 ring-white/5 opacity-80">
                <h4 className="text-[11px] font-bold text-[#6b7280] uppercase tracking-[0.15em] mb-4">Latest Research Activity</h4>
                <div className="space-y-1">
                    <p className="text-[13px] text-[#f0f0f5] font-mono leading-tight">
                        {leadGenJobs?.[0]?.lastEvent?.message || "Waiting for campaign start..."}
                    </p>
                    <p className="text-[10px] text-[#52525e] font-mono">TIMESTAMP: {leadGenJobs?.[0]?._creationTime ? new Date(leadGenJobs[0]._creationTime).toLocaleTimeString() : "--:--:--"}</p>
                </div>
            </div>
        </div>

        {/* Right: Active & Historical Operations */}
        <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-[18px] font-bold text-[#f0f0f5]">Campaign History</h3>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525e]" />
                        <input 
                            placeholder="Filter campaigns..."
                            className="bg-[#161621] border border-[#2e2e40] rounded-lg pl-9 pr-3 py-1.5 text-[12px] text-[#f0f0f5] focus:outline-none focus:border-[#f97316]/50 transition-all w-[180px]"
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
                            className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-12 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#22222e] flex items-center justify-center mx-auto mb-6">
                                <Sparkles size={32} className="text-[#52525e]" />
                            </div>
                            <h4 className="text-[18px] font-bold text-[#f0f0f5] mb-2">No active campaigns</h4>
                            <p className="text-[#9ca3b4] max-w-sm mx-auto">Launch a lead generation campaign to see your results here.</p>
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
        className="group relative bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-5 hover:border-[#f97316]/40 hover:bg-[#22222e] transition-all cursor-pointer overflow-hidden shadow-sm"
    >
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/5 blur-[60px] pointer-events-none group-hover:bg-[#f97316]/10 transition-all" />
        
        <Link href={`/dashboard/marketing/${job._id}`} className="flex items-center gap-6 relative z-10">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                isRunning ? "bg-[#f97316]/10 text-[#f97316]" : "bg-[#22222e] text-[#6b7280]"
            )}>
                {isRunning ? <div className="relative"><Activity size={24} /><div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f97316] rounded-full border-2 border-[#1e1e2c] animate-pulse" /></div> : <CheckCircle2 size={24} />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-[16px] font-bold text-[#f0f0f5] truncate tracking-tight">{job.campaign.targetVertical}</h4>
                    <span className="text-[11px] text-[#52525e] font-mono px-2 py-0.5 rounded-md bg-[#161621] uppercase tracking-wider">{job.campaign.targetGeography}</span>
                </div>
                <div className="flex items-center gap-4 text-[13px] text-[#9ca3b4]">
                    <div className="flex items-center gap-1.5">
                        <Target size={14} className="opacity-60" />
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
                    <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest">Progress</span>
                    <span className="text-[12px] font-mono font-bold text-[#f0f0f5]">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#22222e] rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={cn(
                            "h-full rounded-full",
                            isRunning ? "bg-gradient-to-r from-[#f97316] to-[#ea580c]" : "bg-[#6b7280]"
                        )}
                    />
                </div>
                <div className="flex items-center justify-end gap-1.5 pt-1 text-[#6b7280] group-hover:text-[#f97316] transition-colors">
                    <span className="text-[11px] font-bold font-sans">DETAILS</span>
                    <ArrowUpRight size={12} />
                </div>
            </div>
        </Link>
    </motion.div>
  );
}

function Loader2(props: any) {
    return <Loader2Icon {...props} />;
}

function Loader2Icon({ className, size = 18 }: { className?: string, size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin", className)}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12">
      <div className="flex justify-between items-end">
        <Skeleton className="h-10 w-64 bg-[#26263a]" />
        <Skeleton className="h-11 w-48 bg-[#26263a] rounded-xl" />
      </div>
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 bg-[#1e1e2c] border border-[#2a2a3c] rounded-[16px]" />
        ))}
      </div>
      <div className="grid grid-cols-12 gap-8">
        <Skeleton className="col-span-4 h-[500px] bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px]" />
        <div className="col-span-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
