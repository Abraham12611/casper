"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { OverallProgress } from "./OverallProgress";
import { PhaseTimeline } from "./PhaseTimeline";
import { PageDiscoveryGrid } from "./PageDiscoveryGrid";
import { StreamingSummary } from "./StreamingSummary";
import { EventLog } from "./EventLog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Terminal, Activity, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface WorkflowWithApprovalProps { 
  onCompleted: () => void;
  onWorkflowComplete?: (isComplete: boolean) => void;
}

export function WorkflowWithApproval({ onWorkflowComplete }: WorkflowWithApprovalProps) {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [hasShownToast, setHasShownToast] = useState(false);
  const [hasScrolledToSummary, setHasScrolledToSummary] = useState(false);

  // Get seller brain data to find onboarding flow ID
  const sellerBrain = useQuery(api.sellerBrain.getForCurrentUser);
  const onboardingFlowId = sellerBrain?.onboardingFlowId;
  
  // Get the onboarding flow data
  const flow = useQuery(
    api.onboarding.queries.getOnboardingFlow,
    onboardingFlowId ? { onboardingFlowId } : "skip"
  );

  // Check if workflow is complete
  const isWorkflowComplete = flow?.status === "completed";

  // Notify parent of workflow completion status
  useEffect(() => {
    if (onWorkflowComplete) {
      onWorkflowComplete(isWorkflowComplete);
    }
  }, [isWorkflowComplete, onWorkflowComplete]);

  // Show success toast when workflow completes
  useEffect(() => {
    if (isWorkflowComplete && !hasShownToast) {
      toast.success("Analysis Complete!", {
        description: "Your website has been analyzed successfully. Review the generated content to continue.",
        duration: 5000,
      });
      setHasShownToast(true);
    }
  }, [isWorkflowComplete, hasShownToast]);

  // Callback to scroll when content actually starts rendering
  const handleContentStart = () => {
    if (!hasScrolledToSummary && summaryRef.current) {
      summaryRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
      setHasScrolledToSummary(true);
    }
  };

  if (!onboardingFlowId || !flow) {
    return (
      <div className="max-w-6xl mx-auto w-full space-y-8 animate-pulse">
        <div className="bg-white border border-[#E8E8E8] rounded-xl p-10 text-center">
          <div className="h-10 w-64 bg-[#F5F5F5] rounded-xl mx-auto mb-4" />
          <div className="h-4 w-96 bg-[#F5F5F5] rounded-lg mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-white border border-[#E8E8E8] rounded-xl" />
            <div className="h-[400px] bg-white border border-[#E8E8E8] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-10 pb-32">
        {/* Main Status Hub */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E8E8E8] rounded-[40px] p-10 shadow-2xl  relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1A1A1A] via-[#6B6B6B] to-transparent opacity-50" />
            
            <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Search size={18} className="text-[#1A1A1A]" />
                        <span className="text-[12px] font-mono font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">Website Research Protocol</span>
                    </div>
                    <h1 className="text-[36px] font-bold text-[#1A1A1A] tracking-tight">
                        Analyzing Your Website
                    </h1>
                    <p className="text-[#6B6B6B] text-[16px] max-w-xl">
                        Casper is scanning your website to identify your unique value propositions and client success stories.
                    </p>
                </div>
                
                <div className="w-full md:w-[320px] bg-[#F5F5F5] border border-[#E2E2E2] rounded-xl p-6">
                    <OverallProgress onboardingFlowId={onboardingFlowId} />
                </div>
            </div>

            <Separator className="bg-[#E8E8E8] mb-10" />

            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 px-2">
                    <Terminal size={14} className="text-[#9A9A9A]" />
                    <span className="text-[10px] font-mono font-bold text-[#9A9A9A] uppercase tracking-[0.2em]">Research Activity</span>
                </div>
                <EventLog lastEvent={flow.lastEvent} />
            </div>
        </motion.div>

        {/* Diagnostic Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Signal Chain */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-[#E8E8E8] rounded-xl p-8 shadow-xl "
            >
                <div className="flex items-center gap-3 mb-8 px-2">
                    <Activity size={16} className="text-[#1A1A1A]" />
                    <h2 className="text-[14px] font-mono font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">Research Timeline</h2>
                </div>
                <PhaseTimeline phases={flow.phases} />
            </motion.div>

            {/* Right: Data Discovery */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-[#E8E8E8] rounded-xl p-8 shadow-xl "
            >
                <PageDiscoveryGrid onboardingFlowId={onboardingFlowId} />
            </motion.div>
        </div>

        {/* Logic Synthesis stream */}
        <motion.div 
            ref={summaryRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border border-[#E8E8E8] rounded-xl p-8 shadow-2xl "
        >
            <StreamingSummary 
                onboardingFlowId={onboardingFlowId}
                summaryThread={flow.summaryThread}
                onContentStart={handleContentStart}
            />
        </motion.div>

        {flow.status === "error" && (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-red-400/5 border border-red-400/20 rounded-xl mt-10"
            >
                <div className="flex items-start gap-6">
                    <div className="p-3 bg-red-400/10 rounded-2xl">
                        <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-bold text-red-400 mb-1 uppercase tracking-tight">Analysis Interrupted</h3>
                        <p className="text-[14px] text-red-400/70 font-mono leading-relaxed">
                            We couldn't complete the website analysis. Please check your URL or try again in a few moments.
                        </p>
                    </div>
                </div>
            </motion.div>
        )}
    </div>
  );
}
