"use client";

import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { InitialSetupForm } from "./components/Step1_InitialSetupForm";
import { WorkflowWithApproval } from "./components/Step2_WorkflowWithApproval";
import { ReviewAndEditGenerated } from "./components/Step3_ReviewAndEditGenerated";
import { Step4FinalConfigurationForm } from "./components/Step4_FinalConfigurationForm";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Rocket, 
  Search, 
  FileText, 
  Settings, 
  Loader2, 
  ArrowRight,
  Terminal,
  Activity,
  ShieldCheck,
  Cpu,
  Zap,
  Box,
  Fingerprint,
  Layers,
  Dna
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type OnboardingStep = 1 | 2 | 3 | 4;
type Mode = "manual" | "automated";

interface OnboardingState {
  currentStep: OnboardingStep;
  mode?: Mode;
  agencyProfileId?: Id<"agency_profile">;
  onboardingFlowId?: Id<"onboarding_flow">;
  isWorkflowComplete?: boolean;
}

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[#0d0d12] text-[#1A1A1A]">
      <Unauthenticated>
        <RedirectToHome />
      </Unauthenticated>
      <Authenticated>
        <Content />
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

function Content() {
  const router = useRouter();
  const agencyProfile = useQuery(api.sellerBrain.getForCurrentUser);
  const resetOnboarding = useMutation(api.sellerBrain.debugResetOnboarding);
  const isLoading = agencyProfile === undefined;
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    currentStep: 1,
    isWorkflowComplete: false,
  });

  // Determine current step based on agency profile data
  useEffect(() => {
    if (!agencyProfile) return;

    if (agencyProfile.reviewedAt) {
      setOnboardingState(prev => ({
        ...prev,
        currentStep: 4,
        agencyProfileId: agencyProfile.agencyProfileId as Id<"agency_profile">,
      }));
      return;
    }

    if (agencyProfile.onboardingFlowId) {
      setOnboardingState(prev => ({
        ...prev,
        currentStep: 2,
        mode: "automated",
        onboardingFlowId: agencyProfile.onboardingFlowId,
        agencyProfileId: agencyProfile.agencyProfileId as Id<"agency_profile">,
      }));
      return;
    }

    if (agencyProfile.companyName && !agencyProfile.onboardingFlowId && !agencyProfile.sourceUrl) {
      setOnboardingState(prev => ({
        ...prev,
        currentStep: 3,
        mode: "manual",
        agencyProfileId: agencyProfile.agencyProfileId as Id<"agency_profile">,
      }));
    }
  }, [agencyProfile]);

  const handleStarted = useCallback((params: { mode: Mode; agencyProfileId: string; onboardingFlowId?: string }) => {
    if (params.mode === "automated") {
      setOnboardingState(prev => ({
        ...prev,
        currentStep: 2,
        mode: "automated",
        agencyProfileId: params.agencyProfileId as Id<"agency_profile">,
        onboardingFlowId: params.onboardingFlowId as Id<"onboarding_flow">,
      }));
    } else {
      setOnboardingState(prev => ({
        ...prev,
        currentStep: 3,
        mode: "manual",
        agencyProfileId: params.agencyProfileId as Id<"agency_profile">,
      }));
    }
  }, []);

  const handleWorkflowCompleted = useCallback(() => {
    setOnboardingState(prev => ({
      ...prev,
      currentStep: 3,
      isWorkflowComplete: false,
    }));
  }, []);

  const handleWorkflowComplete = useCallback((isComplete: boolean) => {
    setOnboardingState(prev => ({
      ...prev,
      isWorkflowComplete: isComplete,
    }));
  }, []);

  const handleContentReviewed = useCallback(() => {
    setOnboardingState(prev => ({
      ...prev,
      currentStep: 4,
    }));
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setIsRedirecting(true);
    router.replace("/dashboard");
  }, [router]);

  // Step indicator component with high-fidelity "Initialization" theme
  const InitializationBar = () => {
    const isManual = onboardingState.mode === "manual";
    
    const steps = isManual
      ? [
          { actual: 1 as OnboardingStep, label: "PROFILE", description: "Agency details", icon: Fingerprint, logic: "SETTING_UP" },
          { actual: 3 as OnboardingStep, label: "CONTENT", description: "Review strategies", icon: Layers, logic: "AUDITING" },
          { actual: 4 as OnboardingStep, label: "FINALIZE", description: "Launch ready", icon: Box, logic: "CONFIGURING" },
        ]
      : [
          { actual: 1 as OnboardingStep, label: "PROFILE", description: "Agency details", icon: Fingerprint, logic: "SETTING_UP" },
          { actual: 2 as OnboardingStep, label: "RESEARCH", description: "AI analysis", icon: Search, logic: "SCANNING" },
          { actual: 3 as OnboardingStep, label: "CONTENT", description: "Review strategies", icon: Dna, logic: "AUDITING" },
          { actual: 4 as OnboardingStep, label: "FINALIZE", description: "Launch ready", icon: Settings, logic: "CONFIGURING" },
        ];

    const currentStepIndex = steps.findIndex(s => s.actual === onboardingState.currentStep);
    const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

    return (
      <div className="max-w-4xl mx-auto mb-16 px-4">
        {/* Header Metadata */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E8E8] flex items-center justify-center">
                    <Zap size={20} className="text-[#1A1A1A]" />
                </div>
                <div>
                    <h2 className="text-[12px] font-mono font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">Agency Initialization</h2>
                    <p className="text-[11px] font-mono text-[#9A9A9A] uppercase tracking-wider">Casper Platform v2.05</p>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <button 
                  onClick={async () => {
                    if (confirm("DEBUG: This will delete your current onboarding progress and profile. Continue?")) {
                      await resetOnboarding();
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1.5 rounded-md border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500/70 hover:text-red-500 text-[10px] font-mono uppercase tracking-widest transition-all"
                >
                  [ Restart Onboarding ]
                </button>
                <div className="text-right">
                    <div className="text-[14px] font-mono font-bold text-[#1A1A1A]">{Math.round(progressPercentage)}%</div>
                    <div className="text-[10px] font-mono text-[#9A9A9A] uppercase tracking-widest">{steps[currentStepIndex]?.logic || "PENDING"}</div>
                </div>
            </div>
        </div>

        {/* Progress System */}
        <div className="relative mb-12">
            <div className="absolute inset-0 bg-[#1A1A1A]/5 blur-3xl rounded-full" />
            <div className="relative h-1 bg-white rounded-full overflow-hidden border border-white/5">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1A1A1A] to-[#6B6B6B] shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
            </div>

            {/* Step Nodes */}
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex justify-between">
                {steps.map((s, index) => {
                    const isCompleted = s.actual < onboardingState.currentStep;
                    const isCurrent = s.actual === onboardingState.currentStep;
                    const Icon = s.icon;

                    return (
                        <div key={s.actual} className="relative flex flex-col items-center">
                            <motion.div
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    backgroundColor: isCompleted ? "#1A1A1A" : isCurrent ? "#161621" : "#1e1e2c"
                                }}
                                className={cn(
                                    "w-4 h-4 rounded-full border-2 transition-all duration-500",
                                    isCompleted ? "border-[#1A1A1A] shadow-[0_0_10px_rgba(59,130,246,0.4)]" : 
                                    isCurrent ? "border-[#1A1A1A] bg-[#F5F5F5]" : "border-[#E8E8E8]"
                                )}
                            />
                            <div className="absolute top-8 select-none pointer-events-none">
                                <motion.div 
                                    animate={{ opacity: isCurrent ? 1 : 0.3 }}
                                    className="text-center"
                                >
                                    <p className={cn(
                                        "text-[10px] font-mono font-bold tracking-[0.2em]",
                                        isCurrent ? "text-[#1A1A1A]" : "text-[#9A9A9A]"
                                    )}>
                                        {s.label}
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    );
  };

  const CenteredLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-[#1A1A1A] opacity-20" />
            <Activity className="absolute inset-0 m-auto h-8 w-8 text-[#1A1A1A] animate-pulse" />
        </div>
        <p className="text-[12px] font-mono font-bold text-[#9A9A9A] uppercase tracking-[0.3em] animate-pulse">Syncing Casper Intelligence...</p>
      </div>
    </div>
  );

  if (isLoading || isRedirecting) {
    return <CenteredLoader />;
  }

  return (
    <div className="min-h-screen py-20 px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1A1A1A] blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#6B6B6B] blur-[150px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto w-full relative z-10">
        <InitializationBar />
        
        {/* Step Container */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <AnimatePresence mode="wait">
                <motion.div
                    key={onboardingState.currentStep}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {onboardingState.currentStep === 1 && (
                      <InitialSetupForm onStarted={handleStarted} />
                    )}

                    {onboardingState.currentStep === 2 && onboardingState.mode === "automated" && (
                      <WorkflowWithApproval
                        onCompleted={handleWorkflowCompleted}
                        onWorkflowComplete={handleWorkflowComplete}
                      />
                    )}

                    {onboardingState.currentStep === 3 && onboardingState.agencyProfileId && (
                      <ReviewAndEditGenerated
                        agencyProfileId={onboardingState.agencyProfileId}
                        mode={onboardingState.mode}
                        initialSummary={agencyProfile?.summary}
                        initialCoreOffer={agencyProfile?.coreOffer}
                        initialGuardrails={agencyProfile?.guardrails || []}
                        initialClaims={agencyProfile?.approvedClaims?.map(claim => ({
                          id: claim.id,
                          text: claim.text,
                          source_url: claim.source_url,
                        })) || []}
                        onSaved={handleContentReviewed}
                      />
                    )}

                    {onboardingState.currentStep === 4 && (
                      <Step4FinalConfigurationForm
                        mode={onboardingState.mode}
                        onComplete={handleOnboardingComplete}
                      />
                    )}
                </motion.div>
           </AnimatePresence>
        </div>
      </div>

      {/* Persistence Controls */}
      {onboardingState.currentStep === 2 && onboardingState.isWorkflowComplete && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50"
        >
            <button 
                onClick={handleWorkflowCompleted}
                className="group h-14 px-8 bg-[#1A1A1A] hover:bg-[#2563eb] text-white rounded-full font-bold flex items-center gap-3 shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all transform hover:scale-105 active:scale-95"
            >
                Verify Research Results
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
        </motion.div>
      )}

      {/* Global Metadata Footer */}
  <div className="fixed bottom-6 right-8 pointer-events-none hidden md:block">
    <div className="flex items-center gap-4 text-[10px] font-mono text-[#9A9A9A] uppercase tracking-widest">
        <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-[#2E7D32]" />
            Casper Security Verified
        </div>
        <span className="w-1 h-1 rounded-full bg-[#E8E8E8]" />
        <span>Profile ID: {agencyProfile?.agencyProfileId?.slice(-8) || "PENDING"}</span>
    </div>
  </div>
    </div>
  );
}
