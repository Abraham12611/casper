"use client";

import { useAction, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Loader2, 
  AlertCircle, 
  ArrowRight, 
  Info, 
  Sparkles, 
  Terminal, 
  Globe, 
  Cpu, 
  Fingerprint,
  Zap,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface InitialSetupFormProps {
  onStarted: (params: { mode: "manual" | "automated"; agencyProfileId: string; onboardingFlowId?: string }) => void;
}

export function InitialSetupForm({ onStarted }: InitialSetupFormProps) {
  const seedWorkflow = useAction(api.sellerBrain.seedFromWebsite);
  const startManual = useMutation(api.sellerBrain.startManualOnboarding);
  
  const [companyName, setCompanyName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [mode, setMode] = useState<"manual" | "automated">("automated");
  
  const handleModeChange = (value: string) => {
    const newMode = value as "manual" | "automated";
    setMode(newMode);
    if (newMode === "manual") {
      setSourceUrl("");
    }
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoPath = () => {
    setMode("automated");
    setCompanyName("Lumina Search");
    setSourceUrl("https://lumina-search-demo.vercel.app/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (!companyName.trim()) {
        throw new Error("Please provide a company name.");
      }
      
      if (mode === "automated") {
        if (!sourceUrl.trim()) {
          throw new Error("Please provide a website URL for automated analysis.");
        }
        
        const normalizedUrl = sourceUrl.startsWith("http") 
          ? sourceUrl 
          : `https://${sourceUrl}`;
        
        const result = await seedWorkflow({ 
          companyName: companyName.trim(), 
          sourceUrl: normalizedUrl 
        });
        
        onStarted({ 
          mode: "automated", 
          agencyProfileId: result.agencyProfileId,
        });
      } else {
        const result = await startManual({ 
          companyName: companyName.trim()
        });
        
        onStarted({ 
          mode: "manual", 
          agencyProfileId: result.agencyProfileId 
        });
      }
      
    } catch (err: unknown) {
      const message = typeof err === "object" && err && "message" in err
        ? String((err as { message?: unknown }).message)
        : null;
      setError(message ?? "Failed to start onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8 pb-20">
      {/* Header Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 text-center mb-12"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="text-[#1A1A1A]" size={24} />
            <h1 className="text-[14px] font-mono font-bold text-[#1A1A1A] uppercase tracking-[0.4em]">Agency Setup</h1>
        </div>
        <h2 className="text-[42px] font-bold text-[#1A1A1A] tracking-tight leading-none mb-4">
            Launch Your AI Growth Engine
        </h2>
        <p className="text-[#6B6B6B] text-[17px] max-w-xl mx-auto leading-relaxed">
            Set up your agency in under 3 minutes and start closing qualified leads automatically.
        </p>
      </motion.div>
      
      {/* Mode Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-mono font-bold text-[#9A9A9A] uppercase tracking-widest">How do you want to start?</span>
        </div>
        
        <RadioGroup value={mode} onValueChange={handleModeChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Automated Mode Card */}
            <label 
                htmlFor="automated"
                className={cn(
                    "relative group cursor-pointer transition-all duration-500 rounded-xl p-8 border overflow-hidden",
                    mode === "automated" 
                        ? "bg-white border-[#1A1A1A] shadow-[0_20px_50px_rgba(59,130,246,0.15)] ring-1 ring-[#1A1A1A]" 
                        : "bg-[#F5F5F5] border-[#E8E8E8] hover:border-[#1A1A1A]/40 hover:bg-[#1a1a26]"
                )}
            >
                {mode === "automated" && (
                    <motion.div 
                        layoutId="activeGlow"
                        className="absolute inset-0 bg-gradient-to-br from-[#1A1A1A]/5 to-transparent pointer-events-none" 
                    />
                )}
                
                <div className="relative flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500",
                            mode === "automated" ? "bg-[#1A1A1A] text-white" : "bg-[#F5F5F5] text-[#9A9A9A]"
                        )}>
                            <Cpu size={24} />
                        </div>
                        <RadioGroupItem 
                            value="automated" 
                            id="automated" 
                            className="sr-only"
                        />
                        {mode === "automated" && <CheckCircle2 className="text-[#1A1A1A]" size={20} />}
                    </div>
                    
                    <h3 className={cn(
                        "text-[18px] font-bold mb-2 transition-colors duration-500",
                        mode === "automated" ? "text-white" : "text-[#6B6B6B]"
                    )}>Automated Scan</h3>
                    <p className="text-[13px] text-[#9A9A9A] leading-relaxed group-hover:text-[#6B6B6B] transition-colors">
                        Paste your agency's URL and we'll automatically identify your niche, case studies, and winning claims.
                    </p>
                </div>
            </label>

            {/* Manual Mode Card */}
            <label 
                htmlFor="manual"
                className={cn(
                    "relative group cursor-pointer transition-all duration-500 rounded-xl p-8 border overflow-hidden",
                    mode === "manual" 
                        ? "bg-white border-[#6B6B6B] shadow-[0_20px_50px_rgba(123,97,255,0.15)] ring-1 ring-[#6B6B6B]" 
                        : "bg-[#F5F5F5] border-[#E8E8E8] hover:border-[#6B6B6B]/40 hover:bg-[#1a1a26]"
                )}
            >
                <div className="relative flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500",
                            mode === "manual" ? "bg-[#6B6B6B] text-white" : "bg-[#F5F5F5] text-[#9A9A9A]"
                        )}>
                            <Terminal size={24} />
                        </div>
                        <RadioGroupItem 
                            value="manual" 
                            id="manual" 
                            className="sr-only"
                        />
                        {mode === "manual" && <CheckCircle2 className="text-[#6B6B6B]" size={20} />}
                    </div>
                    
                    <h3 className={cn(
                        "text-[18px] font-bold mb-2 transition-colors duration-500",
                        mode === "manual" ? "text-white" : "text-[#6B6B6B]"
                    )}>Manual Override</h3>
                    <p className="text-[13px] text-[#9A9A9A] leading-relaxed group-hover:text-[#6B6B6B] transition-colors">
                        Define operational guardrails and identity markers from scratch using our command suite.
                    </p>
                </div>
            </label>
        </RadioGroup>
      </div>

      <AnimatePresence>
        {error && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-red-400/10 border border-red-400/20 rounded-2xl flex items-center gap-4"
            >
                <ShieldAlert className="text-red-400" size={20} />
                <p className="text-[13px] font-mono text-red-400 uppercase tracking-widest">{error}</p>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Form Section */}
      <motion.form 
        onSubmit={handleSubmit}
        className="space-y-8"
      >
        <div className="bg-white border border-[#E8E8E8] rounded-xl p-8 space-y-8 shadow-2xl  relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                <button
                  type="button"
                  onClick={handleDemoPath}
                  disabled={loading}
                  className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#9A9A9A] hover:text-[#1A1A1A] uppercase tracking-widest transition-colors group"
                >
                  <Sparkles size={14} className="group-hover:animate-pulse" />
                  Apply Demo Signature
                </button>
            </div>

            <div className="space-y-6 pt-4">
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#9A9A9A] uppercase tracking-[0.2em]">
                        <Activity size={14} />
                        Entity Name
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="ENTER LEGAL DESIGNATION..."
                      disabled={loading}
                      required
                      className="w-full h-16 bg-[#F5F5F5] border border-[#E2E2E2] rounded-2xl px-6 text-[#1A1A1A] font-bold text-[18px] placeholder:text-[#E8E8E8] focus:border-[#1A1A1A] focus:ring-4 focus:ring-[#1A1A1A]/10 outline-none transition-all"
                    />
                </div>

                <div className={cn("space-y-4 transition-all duration-500", mode === "manual" ? "opacity-30 grayscale pointer-events-none scale-[0.98]" : "opacity-100")}>
                    <label className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#9A9A9A] uppercase tracking-[0.2em]">
                        <Globe size={14} />
                        Operation Target URL
                    </label>
                    <div className="relative">
                        <input
                          id="sourceUrl"
                          type="url"
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                          placeholder="HTTPS://SOURCE-ENDPOINT.COM"
                          disabled={loading || mode === "manual"}
                          required={mode === "automated"}
                          className="w-full h-16 bg-[#F5F5F5] border border-[#E2E2E2] rounded-2xl px-6 text-[#1A1A1A] font-mono text-[16px] placeholder:text-[#E8E8E8] focus:border-[#1A1A1A] focus:ring-4 focus:ring-[#1A1A1A]/10 outline-none transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                             <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="p-2 text-[#9A9A9A] cursor-help">
                                        <Info size={18} />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-white border-[#E8E8E8] text-white">
                                    <p className="text-[12px]">Casper will crawl this endpoint to extract operational context.</p>
                                  </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !companyName.trim() || (mode === "automated" && !sourceUrl.trim())}
            className={cn(
                "w-full h-20 rounded-xl flex items-center justify-center gap-4 text-[18px] font-bold uppercase tracking-widest transition-all shadow-2xl",
                loading ? "bg-white text-[#9A9A9A]" : "bg-[#1A1A1A] text-white hover:bg-[#2563eb] shadow-[#1A1A1A]/20"
            )}
        >
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Initializing Pulse Scan...
              </>
            ) : (
              <>
                {mode === "automated" ? "Initiate Intelligence Sync" : "Commit Entity Signature"}
                <ArrowRight className="h-6 w-6" />
              </>
            )}
        </motion.button>
      </motion.form>
    </div>
  );
}
