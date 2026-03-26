"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Terminal, Activity, Zap, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Phase {
  name: "crawl" | "filter" | "scrape" | "summary" | "claims" | "coreOffer" | "verify";
  status: "pending" | "running" | "complete" | "error";
  progress: number; // 0-1
  errorMessage?: string;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
}

interface PhaseTimelineProps {
  phases: Phase[];
}

const PHASE_LABELS = {
  crawl: "NODE_DISCOVERY",
  filter: "SIGNAL_FILTER", 
  scrape: "CONTENT_EXTRACTION",
  summary: "NEURAL_SYNTHESIS",
  claims: "ASSET_GENERATION",
  coreOffer: "LOGIC_MAPPING",
  verify: "INTEGRITY_CHECK"
} as const;

const PHASE_DESCRIPTIONS = {
  crawl: "Crawling website hierarchy...",
  filter: "Analyzing content relevance...",
  scrape: "Extracting detailed datasets...", 
  summary: "Synthesizing business core...",
  claims: "Generating factual evidence...",
  coreOffer: "Mapping value propositions...",
  verify: "Verifying logic against source..."
} as const;

function PhaseCard({ phase, index, isLast }: { phase: Phase; index: number; isLast: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusIcon = () => {
    switch (phase.status) {
      case "pending":
        return <div className="w-2 h-2 rounded-full bg-[#2a2a3c]" />;
      case "running":
        return (
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6] animate-ping absolute inset-0" />
            <div className="w-3 h-3 rounded-full bg-[#3b82f6] relative border border-white/20" />
          </div>
        );
      case "complete":
        return <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    switch (phase.status) {
      case "pending": return "text-[#52525e]";
      case "running": return "text-white";
      case "complete": return "text-[#22c55e]";
      case "error": return "text-red-400";
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return null;
    const seconds = Math.round(duration / 1000);
    return `${seconds}s`;
  };

  const percentage = Math.round(phase.progress * 100);

  return (
    <div className="relative flex gap-6 pb-8 last:pb-0 group">
      {/* Timeline Line */}
      {!isLast && (
          <div 
            className={cn(
                "absolute top-6 left-[7.5px] w-[1px] h-full transition-colors duration-500",
                phase.status === "complete" ? "bg-[#22c55e]/30" : "bg-[#2a2a3c]"
            )} 
          />
      )}

      {/* Status Node */}
      <div className="relative mt-2 flex items-center justify-center w-4 h-4 shrink-0 z-10">
        {getStatusIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
                <span className={cn(
                    "text-[12px] font-mono font-bold uppercase tracking-[0.2em] transition-colors",
                    getStatusColor()
                )}>
                    {PHASE_LABELS[phase.name]}
                </span>
                {phase.status === "running" && (
                    <span className="text-[10px] font-mono font-bold text-[#3b82f6] animate-pulse">
                        [PROCESSING]
                    </span>
                )}
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[#52525e]">
                {phase.duration && (
                    <div className="flex items-center gap-1">
                        <Activity size={12} />
                        {formatDuration(phase.duration)}
                    </div>
                )}
                {phase.status === "running" && <span>{percentage}%</span>}
            </div>
        </div>

        <p className="text-[12px] text-[#52525e] leading-snug">
            {PHASE_DESCRIPTIONS[phase.name]}
        </p>

        <AnimatePresence>
            {phase.status === "running" && phase.progress > 0 && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                >
                    <div className="h-1 bg-[#161621] rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            className="h-full bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {phase.status === "error" && phase.errorMessage && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-auto p-0 text-[10px] text-red-400 hover:text-red-300 font-mono font-bold uppercase tracking-widest"
              >
                {isExpanded ? "Hide" : "Show"} Debug_Log
              </Button>
              {isExpanded && (
                <Alert variant="destructive" className="mt-2 p-3 bg-red-400/5 border-red-400/20 rounded-xl">
                  <AlertDescription className="text-[11px] font-mono leading-relaxed">
                    {phase.errorMessage}
                  </AlertDescription>
                </Alert>
              )}
            </div>
        )}
      </div>
    </div>
  );
}

export function PhaseTimeline({ phases }: PhaseTimelineProps) {
  return (
    <div className="space-y-2 p-4">
        {phases.map((phase, index) => (
          <PhaseCard 
            key={phase.name} 
            phase={phase} 
            index={index} 
            isLast={index === phases.length - 1} 
          />
        ))}
    </div>
  );
}
