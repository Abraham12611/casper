"use client";

import { useQuery } from "convex/react";
import { useThreadMessages, toUIMessages, useSmoothText } from "@convex-dev/agent/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Cpu, Activity, Terminal } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StreamingSummaryProps {
  onboardingFlowId: Id<"onboarding_flow">;
  summaryThread?: string;
  onContentStart?: () => void;
}

export function StreamingSummary({ onboardingFlowId, summaryThread, onContentStart }: StreamingSummaryProps) {
  const flow = useQuery(api.onboarding.queries.getOnboardingFlow, {
    onboardingFlowId
  });

  const effectiveThreadId = summaryThread ?? "";
  const shouldStream = Boolean(summaryThread);
  const messages = useThreadMessages(
    api.onboarding.summary.listSummaryMessages,
    { onboardingFlowId, threadId: effectiveThreadId },
    { initialNumItems: 10, stream: shouldStream }
  );

  const sellerBrain = useQuery(api.sellerBrain.getForCurrentUser);

  const summaryPhase = flow?.phases.find(p => p.name === "summary");
  const isSummaryActive = summaryPhase?.status === "running";
  const isSummaryComplete = summaryPhase?.status === "complete";

  const uiMessages = toUIMessages(shouldStream ? (messages?.results ?? []) : []);
  const latestAssistant = [...uiMessages]
    .reverse()
    .find((m) => m.role === "assistant");
  const streamingContent = latestAssistant?.text ?? "";

  const finalSummary = sellerBrain?.summary;
  const displayContent = finalSummary || streamingContent;
  
  const [smoothContent] = useSmoothText(displayContent, {
    startStreaming: isSummaryActive,
  });

  const contentToShow = smoothContent;

  useEffect(() => {
    if (contentToShow && contentToShow.length > 0 && onContentStart) {
      onContentStart();
    }
  }, [contentToShow, onContentStart]);

  if (!summaryPhase || summaryPhase.status === "pending") {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-white border border-[#E8E8E8] rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#1A1A1A]" />
            <h2 className="text-[12px] font-mono font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">
                Agency Research Feed
            </h2>
        </div>
        <div className="flex items-center gap-3">
            {isSummaryActive && (
              <Badge variant="outline" className="bg-[#1A1A1A]/5 border-[#1A1A1A]/20 text-[#1A1A1A] text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5">
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                RESEARCHING
              </Badge>
            )}
            {isSummaryComplete && (
              <Badge variant="outline" className="bg-[#2E7D32]/5 border-[#2E7D32]/30 text-[#2E7D32] text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5">
                <CheckCircle2 className="w-3 h-3 mr-1.5" />
                COMPLETE
              </Badge>
            )}
        </div>
      </div>

      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl p-8  relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
            <Terminal size={14} className="text-[#9A9A9A]" />
        </div>
        
        <div className="min-h-[160px] relative">
            {contentToShow ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-[15px] text-[#1A1A1A] leading-relaxed font-mono">
                  {contentToShow}
                  {isSummaryActive && (
                    <motion.span 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2.5 h-5 bg-[#1A1A1A] ml-2 align-middle rounded-sm shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 space-y-4">
                <Activity className="w-6 h-6 text-[#1A1A1A] animate-pulse" />
                <p className="text-[10px] font-mono font-bold text-[#9A9A9A] uppercase tracking-[0.3em] animate-pulse">Connecting to research engine...</p>
              </div>
            )}
        </div>
      </div>

      {summaryPhase.errorMessage && (
        <Alert variant="destructive" className="bg-red-400/5 border-red-400/20 rounded-2xl">
          <AlertDescription className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-widest">
            ERROR: {summaryPhase.errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
