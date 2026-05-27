"use client";

import { useQuery, useMutation } from "convex/react";
import { useState, useEffect, useRef, memo } from "react";
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
    Mic2,
    Target
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

const ElevenLabsWidget = memo(({ agentId, variables }: { agentId: string, variables: any }) => {
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="convai-widget-embed"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }
  }, []);

  const serializedVars = JSON.stringify(variables);

  return (
    <div 
      className="w-full flex justify-center py-6"
      dangerouslySetInnerHTML={{
        __html: `<elevenlabs-convai agent-id="${agentId}" dynamic-variables='${serializedVars.replace(/'/g, "&apos;")}'></elevenlabs-convai>`
      }}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if the agentId actually changes. This prevents re-mounting during live transcript/clock ticks!
  return prevProps.agentId === nextProps.agentId;
});

export default function CallWorkspacePage({ params }: Props) {
  const { customer } = useCustomer();
  const [nowTs, setNowTs] = useState<number>(Date.now());
  const [listenModalOpen, setListenModalOpen] = useState(false);
  const [callId, setCallId] = useState<Id<"calls"> | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const appendTranscriptFragment = useMutation(api.elevenlabs.agentMutations.appendWebCallTranscriptFragment);
  const completeWebCall = useMutation(api.elevenlabs.agentMutations.completeWebCall);

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
    if (!callId) return;

    const handleWidgetMessage = (event: any) => {
      console.log("[EL Web Call Custom Event Received]:", event);
      const detail = event.detail;
      if (detail) {
        if (detail.type === "user_transcript" && detail.text) {
          appendTranscriptFragment({
            callId,
            role: "user",
            text: detail.text,
          });
        } else if (detail.type === "agent_response" && detail.text) {
          appendTranscriptFragment({
            callId,
            role: "assistant",
            text: detail.text,
          });
        }
      }
    };

    const handleIframeMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data) {
          console.log("[EL Web Call postMessage Received]:", data);
          if (data.type === "user_transcript" && data.text) {
            appendTranscriptFragment({
              callId,
              role: "user",
              text: data.text,
            });
          } else if (data.type === "agent_response" && data.text) {
            appendTranscriptFragment({
              callId,
              role: "assistant",
              text: data.text,
            });
          } else if (data.type === "conversation_ended") {
            const elapsed = Math.max(1, Math.floor((Date.now() - (call?.startedAt ?? Date.now())) / 1000));
            completeWebCall({
              callId,
              durationSeconds: elapsed,
            });
          }
        }
      } catch (err) {}
    };

    window.addEventListener("elevenlabs-convai:message", handleWidgetMessage);
    window.addEventListener("message", handleIframeMessage);
    document.addEventListener("elevenlabs-convai:message", handleWidgetMessage);

    return () => {
      window.removeEventListener("elevenlabs-convai:message", handleWidgetMessage);
      window.removeEventListener("message", handleIframeMessage);
      document.removeEventListener("elevenlabs-convai:message", handleWidgetMessage);
    };
  }, [callId, call?.startedAt]);

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
        <AlertCircle size={48} className="mx-auto text-[#C62828] opacity-50" />
        <h2 className="text-xl font-bold text-[#1A1A1A]">Call Not Found</h2>
        <Link href="/dashboard/calls">
          <Button variant="outline" className="border-[#E2E2E2] bg-[#F5F5F5] text-[#6B6B6B] hover:text-[#1A1A1A]">
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
        className="bg-white border border-[#E8E8E8] rounded-xl p-8 relative overflow-hidden "
      >
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-[#1A1A1A]/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/calls" className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors text-[#6B6B6B] hover:text-[#1A1A1A]">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">Call Workspace</span>
                        <div className="w-1 h-1 rounded-full bg-[#52525e]" />
                        <span className="text-[11px] font-mono font-bold text-[#6B6B6B] uppercase">ID: {callId.slice(-8)}</span>
                    </div>
                </div>
                
                <h1 className="text-[32px] font-bold text-[#1A1A1A] tracking-tight truncate">
                    {opportunity ? `Call with ${opportunity.name}` : "Call in Progress"}
                </h1>
                
                <div className="flex items-center gap-6">
                    {leadGenJob && (
                        <div className="flex items-center gap-2 text-[13px] text-[#6B6B6B]">
                            <Target size={14} className="text-[#1A1A1A]" />
                            <span>Campaign: {leadGenJob.campaign.targetVertical}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-[13px] text-[#6B6B6B]">
                        <Calendar size={14} className="text-[#1A1A1A]" />
                        <span>{new Date(call._creationTime).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-end gap-4 shrink-0">
                <div className={cn(
                    "px-4 py-1.5 rounded-full border text-[12px] font-bold font-mono uppercase tracking-widest flex items-center gap-2",
                    isInProgress ? "border-[#1A1A1A]/40 bg-[#1A1A1A]/10 text-[#1A1A1A] animate-pulse" : 
                    status === "booked" ? "border-[#2E7D32]/40 bg-[#2E7D32]/10 text-[#2E7D32]" : 
                    "border-[#E2E2E2] bg-[#F5F5F5] text-[#6B6B6B]"
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
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 ">
            <h4 className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest mb-3">Call Duration</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-mono font-bold text-[#1A1A1A]">{formatDuration(durationMs)}</span>
                <span className="text-[12px] text-[#9A9A9A] font-mono">EST</span>
            </div>
        </div>
        
        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 ">
            <h4 className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest mb-3">Lead Information</h4>
            <div className="flex flex-col">
                <span className="text-[16px] font-bold text-[#1A1A1A] truncate">{opportunity?.name || "Identifying..."}</span>
                <span className="text-[12px] text-[#6B6B6B]">{opportunity?.domain || "Processing Website..."}</span>
            </div>
        </div>

        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 ">
            <h4 className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest mb-3">Call Credits</h4>
            <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-mono font-bold text-[#1A1A1A]">{casperCreditsBalance}</span>
                <span className="text-[11px] text-[#9A9A9A] uppercase tracking-tighter">Credits Remaining</span>
            </div>
        </div>

        <div className="bg-white border border-[#E8E8E8] rounded-2xl p-5 ">
            <h4 className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest mb-3">AI Insights</h4>
            <div className="flex flex-wrap gap-1.5 mt-1">
                {opportunity?.signals.length ? opportunity.signals.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-[#F5F5F5] border border-[#E2E2E2] text-[10px] text-[#6B6B6B] font-mono uppercase">
                        {s.replace(/_/g, " ")}
                    </span>
                )) : <span className="text-[12px] text-[#9A9A9A] italic">Gathering insights...</span>}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Signal Decryption Stream */}
        <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden ">
                <div className="px-6 py-5 border-b border-[#E8E8E8] flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-3">
                        <Activity size={18} className="text-[#1A1A1A]" />
                        <h3 className="text-[16px] font-bold text-[#1A1A1A]">Live Transcript</h3>
                    </div>
                    {isInProgress && (
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] animate-pulse" />
                            <span className="text-[10px] font-mono font-bold text-[#1A1A1A] uppercase tracking-widest">REAL-TIME</span>
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
                                            ? "bg-[#252535] border-[#E2E2E2] rounded-tl-none mr-auto" 
                                            : "bg-[#F5F5F5] border-[#E2E2E2] rounded-tr-none ml-auto text-right border-l-2 border-l-[#1A1A1A]/40"
                                    )}
                                >
                                    <div className={cn(
                                        "flex items-center gap-2 mb-2 text-[10px] font-mono font-bold uppercase tracking-widest",
                                        fragment.role === "assistant" ? "text-[#6B6B6B]" : "text-[#1A1A1A] flex-row-reverse"
                                    )}>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded bg-white border border-[#E2E2E2]",
                                            fragment.role === "assistant" ? "" : "text-[#1A1A1A] border-[#1A1A1A]/20"
                                        )}>
                                            {fragment.role === "assistant" ? "Casper AI" : "Prospect"}
                                        </span>
                                        {fragment.timestamp && (
                                            <span className="text-[#9A9A9A]">
                                                {new Date(fragment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[14px] leading-relaxed text-[#1A1A1A]">
                                        {fragment.text}
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                {isInProgress ? (
                                    <div className="w-12 h-12 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Signal size={48} className="text-[#9A9A9A]" />
                                )}
                                <p className="text-[14px] text-[#6B6B6B] font-mono uppercase tracking-widest">
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
            <div className="bg-white border border-[#E8E8E8] rounded-xl p-6  space-y-6">
                <div className="flex items-center gap-3">
                    <FileText size={18} className="text-[#1A1A1A]" />
                    <h3 className="text-[16px] font-bold text-[#1A1A1A]">Call Summary</h3>
                </div>
                
                <Separator className="bg-[#E8E8E8]" />

                {call.summary ? (
                    <div className="space-y-4 animate-fade-in">
                        <p className="text-[14px] leading-relaxed text-[#6B6B6B]">
                            {call.summary}
                        </p>
                        {opportunity?.fit_reason && (
                            <div className="p-4 bg-[#F5F5F5] border border-[#E2E2E2] rounded-xl space-y-2">
                                <h5 className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">AI Reasoning</h5>
                                <p className="text-[12px] text-[#1A1A1A] italic leading-snug">
                                    "{opportunity.fit_reason}"
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center text-[#9A9A9A] space-y-3">
                        <Mic2 size={32} className="mx-auto opacity-20" />
                        <p className="text-[12px] font-mono uppercase tracking-[0.1em]">Awaiting Outcome Analysis</p>
                    </div>
                )}
            </div>

            {/* Opportunity Details Panel */}
            {opportunity && (
                <div className="bg-white border border-[#E8E8E8] rounded-xl p-6  overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 bg-gradient-to-bl from-white to-transparent" />
                    <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-5">Lead Specifications</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h6 className="text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Entity</h6>
                                <p className="text-[13px] text-[#1A1A1A] font-semibold truncate">{opportunity.name}</p>
                            </div>
                            <div>
                                <h6 className="text-[10px] font-bold text-[#6B6B6B] uppercase mb-1">Domain</h6>
                                <p className="text-[13px] text-[#1A1A1A] truncate hover:underline cursor-pointer">
                                    {opportunity.domain || "Internal"}
                                </p>
                            </div>
                        </div>
                        {opportunity.domain && (
                            <Button asChild variant="outline" className="w-full bg-[#F5F5F5] border-[#E2E2E2] text-[#6B6B6B] hover:text-[#1A1A1A]">
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
        <DialogContent className="sm:max-w-xl bg-[#1a1a26]/95 backdrop-blur-3xl border-[#E8E8E8] text-[#1A1A1A] shadow-2xl rounded-xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <Headphones className="h-6 w-6 text-[#1A1A1A]" />
              Live Listen
            </DialogTitle>
            <DialogDescription className="text-[#6B6B6B] pt-2">
              Connecting to the live call. Your connection is secure and encrypted.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 bg-[#0d0d13] border border-[#E2E2E2] rounded-2xl shadow-inner">
            <LiveListen listenUrl={call.monitorUrls?.listenUrl || null} />
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setListenModalOpen(false)} variant="ghost" className="text-[#6B6B6B] hover:text-white hover:bg-[#F5F5F5]">
                Close Live Listen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dynamic Left Web Call Drawer Overlay */}
      <AnimatePresence>
        {call.provider === "web" && status === "in-progress" && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{ backdropFilter: "blur(24px)", backgroundColor: "rgba(10, 10, 20, 0.95)" }}
            className="fixed top-0 left-0 h-full w-[420px] border-r border-[#2C2C3E] shadow-2xl z-50 p-8 flex flex-col justify-between overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E53935] animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-white uppercase tracking-[0.2em]">Active Web Call</span>
                </div>
                <div className="px-2.5 py-0.5 rounded bg-[#2C2C3E] text-[10px] text-[#A0A0B0] font-mono uppercase">
                  Browser Test
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Casper Voice Agent
                </h2>
                <p className="text-[14px] text-[#A0A0B0] leading-relaxed">
                  Speak clearly into your microphone. The agent is analyzing your responses in real-time.
                </p>
              </div>

              <Separator className="bg-[#2C2C3E]" />

              {/* Injected HTML web component widget */}
              <div className="bg-[#10101C]/80 border border-[#2C2C3E] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px]">
                {call.assistantId ? (
                  <ElevenLabsWidget 
                    agentId={call.assistantId} 
                    variables={{
                      agency_name: opportunity?.name ? opportunity.name : "Lumina Search",
                      agency_summary: opportunity?.fit_reason ? opportunity.fit_reason : "A professional services company",
                      agency_core_offer: opportunity?.fit_reason ? opportunity.fit_reason : "Professional marketing services",
                      caller_name: opportunity?.name ?? "there",
                      company_name: opportunity?.name ?? "your company",
                      fit_reason: opportunity?.fit_reason ?? "online presence opportunities",
                      available_slots: "Tue 10:00-12:00",
                      available_slots_short: "Tue 10:00",
                    }}
                  />
                ) : (
                  <div className="text-center py-6 text-[#6B6B6B]">
                    <CircleDashed size={24} className="animate-spin mx-auto mb-2 text-[#A0A0B0]" />
                    <p className="text-xs font-mono uppercase text-[#A0A0B0]">Initializing Agent...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer / End Call Button */}
            <div className="space-y-4 pt-6">
              <div className="p-4 bg-[#10101C]/50 border border-[#2C2C3E] rounded-xl flex items-center gap-3">
                <Mic2 className="h-5 w-5 text-white animate-pulse" />
                <span className="text-xs text-[#A0A0B0]">Microphone actively streaming to ElevenLabs.</span>
              </div>
              <Button
                onClick={async () => {
                  const elapsedSeconds = Math.max(1, Math.floor((Date.now() - (call.startedAt ?? Date.now())) / 1000));
                  await completeWebCall({
                    callId: callId!,
                    durationSeconds: elapsedSeconds,
                  });
                }}
                className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold h-12 rounded-xl transition-all"
              >
                <Phone className="mr-2 h-5 w-5 rotate-[135deg]" />
                End Web Call
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CallDetailSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-8 animate-pulse">
      <div className="h-48 bg-white rounded-xl border border-[#E8E8E8]" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white border border-[#E8E8E8] rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 h-[600px] bg-white border border-[#E8E8E8] rounded-xl" />
        <div className="col-span-4 space-y-6">
            <div className="h-[300px] bg-white border border-[#E8E8E8] rounded-xl" />
            <div className="h-[200px] bg-white border border-[#E8E8E8] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
