"use client";

import { useQuery } from "convex/react";
import { useState, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { 
    Phone, 
    Clock, 
    Calendar, 
    Activity, 
    Target, 
    Search, 
    Filter,
    ArrowUpRight,
    Wifi,
    CheckCircle2,
    XCircle,
    Zap,
    ExternalLink,
    AudioLines
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CasperStatCard } from "@/components/ui/CasperStatCard";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function CallsPage() {
  const agencyProfile = useQuery(api.sellerBrain.getForCurrentUser);

  // Query for calls
  const calls = useQuery(
    api.call.calls.getCallsByAgency,
    agencyProfile?.agencyProfileId ? { agencyId: agencyProfile.agencyProfileId } : "skip"
  );

  const meetings = useQuery(
    api.call.meetings.listByAgency,
    agencyProfile?.agencyProfileId ? { agencyId: agencyProfile.agencyProfileId } : "skip"
  );

  // Sort calls by creation time, most recent first
  const sortedCalls = useMemo(() => {
    if (!calls) return [];
    return [...calls].sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));
  }, [calls]);

  // Group calls by status for stats
  const callStats = useMemo(() => {
    if (!calls) return { total: 0, inProgress: 0, booked: 0, rejected: 0 };
    
    return {
      total: calls.length,
      inProgress: calls.filter(call => (call.currentStatus || call.status) === "in-progress").length,
      booked: calls.filter(call => (call.currentStatus || call.status) === "booked").length,
      rejected: calls.filter(call => (call.currentStatus || call.status) === "rejected").length,
    };
  }, [calls]);

  const formatDuration = (ms: number | undefined): string => {
    if (!ms || ms < 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (calls === undefined) {
      return <CallsPageSkeleton />;
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
            Call Activity
          </h1>
          <p className="text-[#9ca3b4] text-[15px]">
            Automated sales calls and lead interactions are being <span className="text-[#22c55e] font-medium">processed</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-[#26263a]/50 border border-[#2a2a3c] rounded-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse" />
                <span className="text-[12px] font-mono font-bold text-[#f0f0f5] uppercase tracking-wider">SYSTEM READY</span>
            </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <CasperStatCard 
          title="In Progress" 
          value={callStats.inProgress} 
          subtitle="Calls currently active"
          accentColor="#f97316"
          delay={1}
        />
        <CasperStatCard 
          title="Total Calls" 
          value={callStats.total} 
          subtitle="Lifetime call volume"
          accentColor="#3b82f6"
          delay={2}
        />
        <CasperStatCard 
          title="Booking Yield" 
          value={callStats.total ? Math.round((callStats.booked / callStats.total) * 100) : 0} 
          suffix="%"
          subtitle="Booking efficiency"
          accentColor="#22c55e"
          delay={3}
        />
        <CasperStatCard 
          title="Meetings Booked" 
          value={meetings?.length || 0} 
          subtitle="Confirmed follow-ups"
          accentColor="#7b61ff"
          delay={4}
        />
      </div>

      {/* Call Stream Workspace */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-[#f0f0f5]">Call History</h3>
            <div className="flex gap-4">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525e]" />
                    <input 
                        placeholder="Search IDs..."
                        className="bg-[#161621] border border-[#2e2e40] rounded-lg pl-9 pr-3 py-1.5 text-[12px] text-[#f0f0f5] focus:outline-none focus:border-[#f97316]/50 transition-all w-[180px]"
                    />
                </div>
                <Button variant="outline" size="sm" className="bg-[#161621] border-[#2e2e40] text-[#9ca3b4] hover:text-[#f0f0f5] h-8">
                    <Filter size={14} className="mr-2" />
                    Filter
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
                {sortedCalls.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-16 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-[#22222e] flex items-center justify-center mx-auto mb-6">
                            <AudioLines size={32} className="text-[#52525e]" />
                        </div>
                        <h4 className="text-[18px] font-bold text-[#f0f0f5] mb-2">No calls recorded</h4>
                        <p className="text-[#9ca3b4] max-w-sm mx-auto">Your call history will appear here once you start a lead generation campaign.</p>
                    </motion.div>
                ) : (
                    sortedCalls.map((call, idx) => (
                        <SignalCard key={call._id} call={call} delay={idx * 0.05} formatDuration={formatDuration} />
                    ))
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SignalCard({ call, delay, formatDuration }: { call: Doc<"calls">, delay: number, formatDuration: any }) {
  const status = call.currentStatus || call.status;
  const isRunning = status === "in-progress";
  const duration = formatDuration(call.billingSeconds ? call.billingSeconds * 1000 : call.duration);

  return (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="group relative bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px] p-5 hover:border-[#f97316]/40 hover:bg-[#22222e] transition-all cursor-pointer overflow-hidden shadow-sm"
    >
        <Link href={`/dashboard/calls/${call._id}`} className="flex items-center gap-6 relative z-10">
            {/* Status Visual */}
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0",
                isRunning ? "bg-[#f97316]/10 text-[#f97316]" : "bg-[#22222e] text-[#6b7280]"
            )}>
                {isRunning ? (
                    <div className="relative">
                        <Wifi size={24} className="animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#f97316] rounded-full border-2 border-[#1e1e2c]" />
                    </div>
                ) : (
                    status === "booked" ? <CheckCircle2 size={24} className="text-[#22c55e]" /> : <Clock size={24} />
                )}
            </div>

            {/* Metadata */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 font-mono">
                    <span className="text-[#f97316] text-[12px] font-bold tracking-widest uppercase">CALL #{call._id.slice(-8)}</span>
                    <Badge variant="outline" className={cn(
                        "text-[10px] rounded-md px-2 py-0.5 uppercase tracking-tighter border-[#2e2e40] bg-[#161621]",
                        status === "booked" ? "text-[#22c55e]" : 
                        status === "rejected" ? "text-[#ef4444]" : "text-[#9ca3b4]"
                    )}>
                        {status.replace(/_/g, " ")}
                    </Badge>
                </div>
                <div className="flex items-center gap-5 text-[14px] text-[#f0f0f5]">
                    <span className="font-semibold">{isRunning ? "Dialing..." : (call.summary ? call.summary.slice(0, 60) + "..." : "No analysis available")}</span>
                </div>
            </div>

            {/* Timeline & Duration */}
            <div className="flex flex-col items-end gap-1 shrink-0 px-4">
                <div className="flex items-center gap-2 text-[#6b7280] text-[12px]">
                    <Clock size={12} />
                    <span className="font-mono text-[#f0f0f5]">{duration}</span>
                </div>
                <div className="text-[11px] text-[#52525e]">
                    {new Date(call._creationTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center gap-2 text-[#52525e] group-hover:text-[#f97316] transition-colors shrink-0">
                <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:block">VIEW</span>
                <ArrowUpRight size={16} />
            </div>
        </Link>
    </motion.div>
  );
}

function CallsPageSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12">
      <div className="h-20 w-1/3 bg-[#1e1e2c] rounded-2xl animate-pulse" />
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl animate-pulse" />)}
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px] animate-pulse" />)}
      </div>
    </div>
  );
}
