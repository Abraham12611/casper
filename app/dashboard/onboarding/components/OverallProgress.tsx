"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OverallProgressProps {
  onboardingFlowId: Id<"onboarding_flow">;
}

export function OverallProgress({ onboardingFlowId }: OverallProgressProps) {
  const progress = useQuery(api.onboarding.queries.getOverallProgress, { 
    onboardingFlowId 
  });
  
  if (progress === undefined) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-32 bg-[#E8E8E8]" />
          <Skeleton className="h-3 w-12 bg-[#E8E8E8]" />
        </div>
        <Skeleton className="h-2 w-full rounded-full bg-white" />
      </div>
    );
  }

  const percentage = Math.round(progress * 100);
  const isComplete = progress >= 1;
  const hasStarted = progress > 0;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Activity size={14} className={cn("transition-colors", isComplete ? "text-[#2E7D32]" : "text-[#1A1A1A]")} />
            <span className="text-[11px] font-mono font-bold text-[#9A9A9A] uppercase tracking-[0.2em]">
                Setup Progress
            </span>
        </div>
        <span className="text-[12px] font-mono font-bold text-[#1A1A1A]">
          {percentage}%
        </span>
      </div>
      
      <div className="relative h-2 bg-[#F5F5F5] rounded-full overflow-hidden border border-white/5 ring-1 ring-[#E8E8E8]/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn(
            "absolute top-0 left-0 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]",
            isComplete 
              ? 'bg-[#2E7D32]' 
              : 'bg-gradient-to-r from-[#1A1A1A] to-[#6B6B6B]'
          )}
        />
      </div>
      
      {isComplete ? (
        <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
          <span className="text-[11px] text-[#2E7D32] font-mono font-bold uppercase tracking-widest">
            READY TO LAUNCH
          </span>
        </motion.div>
      ) : (
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A] animate-pulse" />
            <span className="text-[10px] text-[#9A9A9A] font-mono uppercase tracking-widest animate-pulse">
                Building your agency strategy...
            </span>
        </div>
      )}
    </div>
  );
}
