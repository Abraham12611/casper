"use client";

import { useQuery } from "convex/react";
import { useState, useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCustomer } from "autumn-js/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import LiveListen from "@/components/LiveListen";
import Link from "next/link";
import { 
    ArrowLeft, 
    Phone, 
    Clock, 
    AlertCircle, 
    ExternalLink, 
    TrendingUp, 
    Calendar, 
    Headphones, 
    CreditCard,
    Signal,
    Activity,
    FileText,
    Zap,
    MapPin,
    ArrowUpRight,
    CircleDashed,
    Mic2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Props = {
  params: Promise<{ callId: string }>;
};

type TranscriptFragment = { 
  role?: string; 
  text?: string; 
  timestamp?: number; 
  source?: string; 
};

export default function CallWorkspacePage({ params }: Props) {
  const { customer } = useCustomer();
  const [nowTs, setNowTs] = useState<number>(Date.now());
  const [listenModalOpen, setListenModalOpen] = useState(false);
  const [callId, setCallId] = useState<Id<"calls"> | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    params.then(({ callId: callIdString }) => {
      setCallId(callIdString as Id<"calls">);
    });
  }, [params]);

  const call = useQuery(api.call.calls.getCallById, callId ? { callId } : "skip");
  const opportunity = useQuery(
    api.marketing.getOpportunityById,
    call?.opportunityId ? { opportunityId: call.opportunityId } : "skip"
  );
  const leadGenJob = useQuery(
    api.marketing.getLeadGenJob,
    opportunity?.leadGenFlowId ? { jobId: opportunity.leadGenFlowId } : "skip"
  );

  const casperCreditsBalance = customer?.features?.atlas_credits?.balance ?? 0;

  useEffect(() => {
    if (!call) return;
    const status = call.currentStatus ?? call.status ?? "unknown";
    if (status === "in-progress" && typeof call.startedAt === "number") {
      const id = setInterval(() => setNowTs(Date.now()), 1000);
      return () => clearInterval(id);
    }
  }, [call]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [call?.transcript]);

  function formatDuration(ms: number | undefined): string {
    if (!ms || ms < 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  if (!callId || call === undefined) return <CallDetailSkeleton />;

  if (call === null) return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center space-y-4">
        <AlertCircle size={48} className="mx-auto text-[#ef4444] opacity-50" />
        <h2 className="text-xl font-bold text-[#f0f0f5]">Call Not Found</h2>
        <Link href="/dashboard/calls">
          <Button variant="outline" className="border-[#2e2e40] bg-[#161621] text-[#9ca3b4] hover:text-[#f0f0f5]">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );

  const status = call.currentStatus ?? call.status ?? "unknown";
  const isInProgress = status === "in-progress";
  const startedAt = call.startedAt;
  const durationMs = (call.billingSeconds ? call.billingSeconds * 1000 : (isInProgress && startedAt ? Math.max(0, nowTs - startedAt) : call.duration)) || 0;

  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-8">
      {/* Operation Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-8 relative overflow-hidden ring-1 ring-white/5"
      >
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-[#f97316]/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/calls" className="p-2 hover:bg-[#26263a] rounded-lg transition-colors text-[#6b7280] hover:text-[#f0f0f5]">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-[#f97316] uppercase tracking-[0.2em]">Call Workspace</span>
                        <div className="w-1 h-1 rounded-full bg-[#52525e]" />
                        <span className="text-[11px] font-mono font-bold text-[#6b7280] uppercase">ID: {callId.slice(-8)}</span>
                    </div>
                </div>
                
                <h1 className="text-[32px] font-bold text-[#f0f0f5] tracking-tight truncate">
                    {opportunity ? `Call with ${opportunity.name}` : "Call in Progress"}
                </h1>
                
                <div className="flex items-center gap-6">
                    {leadGenJob && (
                        <div className="flex items-center gap-2 text-[13px] text-[#9ca3b4]">
                            <Target size={14} className="text-[#f97316]" />
                            <span>Campaign: {leadGenJob.campaign.targetVertical}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-[13px] text-[#9ca3b4]">
                        <Calendar size={14} className="text-[#3b82f6]" />
                        <span>{new Date(call._creationTime).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-4 shrink-0">
                <div className={cn(
                    "px-4 py-1.5 rounded-full border text-[12px] font-bold font-mono uppercase tracking-widest flex items-center gap-2",
                    isInProgress ? "border-[#f97316]/40 bg-[#f97316]/10 text-[#f97316] animate-pulse" : 
                    status === "booked" ? "border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]" : 
                    "border-[#2e2e40] bg-[#161621] text-[#9ca3b4]"
                )}>
                    {isInProgress && <CircleDashed size={14} className="animate-spin" />}
                    {status.replace(/_/g, " ")}
                </div>
                
                {isInProgress && call.monitorUrls?.listenUrl && (
                    <Button 
                        onClick={() => setListenModalOpen(true)}
                        className="bg-[#f0f0f5] text-[#1a1a26] hover:bg-white font-bold h-11 px-6 rounded-xl shadow-xl hover:scale-105 transition-all"
                    >
                        <Headphones size={18} className="mr-2" />
                        Listen Live
                    </Button>
                )}
            </div>
        </div>
      </motion.div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl p-5 ring-1 ring-white/5">
            <h4 className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">Call Duration</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-mono font-bold text-[#f0f0f5]">{formatDuration(durationMs)}</span>
                <span className="text-[12px] text-[#52525e] font-mono">EST</span>
            </div>
        </div>
        
        <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl p-5 ring-1 ring-white/5">
            <h4 className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">Lead Information</h4>
            <div className="flex flex-col">
                <span className="text-[16px] font-bold text-[#f0f0f5] truncate">{opportunity?.name || "Identifying..."}</span>
                <span className="text-[12px] text-[#9ca3b4]">{opportunity?.domain || "Processing Website..."}</span>
            </div>
        </div>

        <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl p-5 ring-1 ring-white/5">
            <h4 className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">Call Credits</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-mono font-bold text-[#f97316]">{casperCreditsBalance}</span>
                <span className="text-[11px] text-[#52525e] uppercase tracking-tighter">Credits Remaining</span>
            </div>
        </div>

        <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl p-5 ring-1 ring-white/5">
            <h4 className="text-[10px] font-bold text-[#6b7280] uppercase tracking-widest mb-3">AI Insights</h4>
            <div className="flex flex-wrap gap-1.5 mt-1">
                {opportunity?.signals.length ? opportunity.signals.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-[#161621] border border-[#2e2e40] text-[10px] text-[#9ca3b4] font-mono uppercase">
                        {s.replace(/_/g, " ")}
                    </span>
                )) : <span className="text-[12px] text-[#52525e] italic">Gathering insights...</span>}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Signal Decryption Stream */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl overflow-hidden ring-1 ring-white/5">
                <div className="px-6 py-5 border-b border-[#2a2a3c] flex items-center justify-between bg-[#1e1e2c]/50">
                    <div className="flex items-center gap-3">
                        <Activity size={18} className="text-[#f97316]" />
                        <h3 className="text-[16px] font-bold text-[#f0f0f5]">Live Transcript</h3>
                    </div>
                    {isInProgress && (
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
                            <span className="text-[10px] font-mono font-bold text-[#f97316] uppercase tracking-widest">REAL-TIME</span>
                        </div>
                    )}
                </div>

                <div 
                    ref={transcriptRef}
                    className="p-6 h-[600px] overflow-y-auto space-y-4 scrollbar-premium"
                >
                    <AnimatePresence>
                        {Array.isArray(call.transcript) && call.transcript.length > 0 ? (
                            call.transcript.map((fragment: TranscriptFragment, idx: number) => (
                                <motion.div
                                    key={`frag-${idx}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "max-w-[85%] p-4 rounded-2xl border transition-all",
                                        fragment.role === "assistant" 
                                            ? "bg-[#252535] border-[#2e2e40] rounded-tl-none mr-auto" 
                                            : "bg-[#161621] border-[#2e2e40] rounded-tr-none ml-auto text-right border-l-2 border-l-[#f97316]/40"
                                    )}
                                >
                                    <div className={cn(
                                        "flex items-center gap-2 mb-2 text-[10px] font-mono font-bold uppercase tracking-widest",
                                        fragment.role === "assistant" ? "text-[#9ca3b4]" : "text-[#f97316] flex-row-reverse"
                                    )}>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded bg-[#1e1e2c] border border-[#2e2e40]",
                                            fragment.role === "assistant" ? "" : "text-[#f97316] border-[#f97316]/20"
                                        )}>
                                            {fragment.role === "assistant" ? "Casper AI" : "Prospect"}
                                        </span>
                                        {fragment.timestamp && (
                                            <span className="text-[#52525e]">
                                                {new Date(fragment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[14px] leading-relaxed text-[#f0f0f5]">
                                        {fragment.text}
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                {isInProgress ? (
                                    <div className="w-12 h-12 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Signal size={48} className="text-[#52525e]" />
                                )}
                                <p className="text-[14px] text-[#9ca3b4] font-mono uppercase tracking-widest">
                                    {isInProgress ? "Connecting to call..." : "No Transcript Available"}
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        {/* Right: Intelligence Brief */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-6 ring-1 ring-white/5 space-y-6">
                <div className="flex items-center gap-3">
                    <FileText size={18} className="text-[#3b82f6]" />
                    <h3 className="text-[16px] font-bold text-[#f0f0f5]">Call Summary</h3>
                </div>
                
                <Separator className="bg-[#2a2a3c]" />

                {call.summary ? (
                    <div className="space-y-4 animate-fade-in">
                        <p className="text-[14px] leading-relaxed text-[#9ca3b4]">
                            {call.summary}
                        </p>
                        {opportunity?.fit_reason && (
                            <div className="p-4 bg-[#161621] border border-[#2e2e40] rounded-xl space-y-2">
                                <h5 className="text-[11px] font-bold text-[#f97316] uppercase tracking-wider">AI Reasoning</h5>
                                <p className="text-[12px] text-[#f0f0f5] italic leading-snug">
                                    "{opportunity.fit_reason}"
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center text-[#52525e] space-y-3">
                        <Mic2 size={32} className="mx-auto opacity-20" />
                        <p className="text-[12px] font-mono uppercase tracking-[0.1em]">Awaiting Outcome Analysis</p>
                    </div>
                )}
            </div>

            {/* Opportunity Details Panel */}
            {opportunity && (
                <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-6 ring-1 ring-white/5 overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-bl from-white to-transparent" />
                    <h3 className="text-[14px] font-bold text-[#f0f0f5] mb-5">Lead Specifications</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h6 className="text-[10px] font-bold text-[#6b7280] uppercase mb-1">Entity</h6>
                                <p className="text-[13px] text-[#f0f0f5] font-semibold truncate">{opportunity.name}</p>
                            </div>
                            <div>
                                <h6 className="text-[10px] font-bold text-[#6b7280] uppercase mb-1">Domain</h6>
                                <p className="text-[13px] text-[#3b82f6] truncate hover:underline cursor-pointer">
                                    {opportunity.domain || "Internal"}
                                </p>
                            </div>
                        </div>
                        {opportunity.domain && (
                            <Button asChild variant="outline" className="w-full bg-[#161621] border-[#2e2e40] text-[#9ca3b4] hover:text-[#f0f0f5]">
                                <a href={`https://${opportunity.domain}`} target="_blank">
                                    <ExternalLink size={14} className="mr-2" />
                                    Visit Website
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Live Listen Modal */}
      <Dialog open={listenModalOpen} onOpenChange={setListenModalOpen}>
        <DialogContent className="sm:max-w-xl bg-[#1a1a26]/95 backdrop-blur-3xl border-[#2a2a3c] text-[#f0f0f5] shadow-2xl rounded-3xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <Headphones className="h-6 w-6 text-[#f97316]" />
              Live Listen
            </DialogTitle>
            <DialogDescription className="text-[#9ca3b4] pt-2">
              Connecting to the live call. Your connection is secure and encrypted.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 bg-[#0d0d13] border border-[#2e2e40] rounded-2xl shadow-inner">
            <LiveListen listenUrl={call.monitorUrls?.listenUrl || null} />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setListenModalOpen(false)} variant="ghost" className="text-[#6b7280] hover:text-white hover:bg-[#26263a]">
                Close Live Listen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CallDetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-8 animate-pulse">
      <div className="h-48 bg-[#1e1e2c] rounded-3xl border border-[#2a2a3c]" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 h-[600px] bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl" />
        <div className="col-span-4 space-y-6">
            <div className="h-[300px] bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl" />
            <div className="h-[200px] bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
