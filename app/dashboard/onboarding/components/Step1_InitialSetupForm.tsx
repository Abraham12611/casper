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
            <Rocket className="text-[#3b82f6]" size={24} />
            <h1 className="text-[14px] font-mono font-bold text-[#3b82f6] uppercase tracking-[0.4em]">Agency Setup</h1>
        </div>
        <h2 className="text-[42px] font-bold text-[#f0f0f5] tracking-tight leading-none mb-4">
            Launch Your AI Growth Engine
        </h2>
        <p className="text-[#9ca3b4] text-[17px] max-w-xl mx-auto leading-relaxed">
            Set up your agency in under 3 minutes and start closing qualified leads automatically.
        </p>
      </motion.div>
      
      {/* Mode Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-widest">How do you want to start?</span>
        </div>
        
        <RadioGroup value={mode} onValueChange={handleModeChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Automated Mode Card */}
            <label 
                htmlFor="automated"
                className={cn(
                    "relative group cursor-pointer transition-all duration-500 rounded-[32px] p-8 border overflow-hidden",
                    mode === "automated" 
                        ? "bg-[#1e1e2c] border-[#3b82f6] shadow-[0_20px_50px_rgba(59,130,246,0.15)] ring-1 ring-[#3b82f6]" 
                        : "bg-[#161621] border-[#2a2a3c] hover:border-[#3b82f6]/40 hover:bg-[#1a1a26]"
                )}
            >
                {mode === "automated" && (
                    <motion.div 
                        layoutId="activeGlow"
                        className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 to-transparent pointer-events-none" 
                    />
                )}
                
                <div className="relative flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500",
                            mode === "automated" ? "bg-[#3b82f6] text-white" : "bg-[#26263a] text-[#52525e]"
                        )}>
                            <Cpu size={24} />
                        </div>
                        <RadioGroupItem 
                            value="automated" 
                            id="automated" 
                            className="sr-only"
                        />
                        {mode === "automated" && <CheckCircle2 className="text-[#3b82f6]" size={20} />}
                    </div>
                    
                    <h3 className={cn(
                        "text-[18px] font-bold mb-2 transition-colors duration-500",
                        mode === "automated" ? "text-white" : "text-[#9ca3b4]"
                    )}>Automated Scan</h3>
                    <p className="text-[13px] text-[#52525e] leading-relaxed group-hover:text-[#9ca3b4] transition-colors">
                        Paste your agency's URL and we'll automatically identify your niche, case studies, and winning claims.
                    </p>
                </div>
            </label>

            {/* Manual Mode Card */}
            <label 
                htmlFor="manual"
                className={cn(
                    "relative group cursor-pointer transition-all duration-500 rounded-[32px] p-8 border overflow-hidden",
                    mode === "manual" 
                        ? "bg-[#1e1e2c] border-[#7b61ff] shadow-[0_20px_50px_rgba(123,97,255,0.15)] ring-1 ring-[#7b61ff]" 
                        : "bg-[#161621] border-[#2a2a3c] hover:border-[#7b61ff]/40 hover:bg-[#1a1a26]"
                )}
            >
                <div className="relative flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-500",
                            mode === "manual" ? "bg-[#7b61ff] text-white" : "bg-[#26263a] text-[#52525e]"
                        )}>
                            <Terminal size={24} />
                        </div>
                        <RadioGroupItem 
                            value="manual" 
                            id="manual" 
                            className="sr-only"
                        />
                        {mode === "manual" && <CheckCircle2 className="text-[#7b61ff]" size={20} />}
                    </div>
                    
                    <h3 className={cn(
                        "text-[18px] font-bold mb-2 transition-colors duration-500",
                        mode === "manual" ? "text-white" : "text-[#9ca3b4]"
                    )}>Manual Override</h3>
                    <p className="text-[13px] text-[#52525e] leading-relaxed group-hover:text-[#9ca3b4] transition-colors">
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
        <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[32px] p-8 space-y-8 shadow-2xl ring-1 ring-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                <button
                  type="button"
                  onClick={handleDemoPath}
                  disabled={loading}
                  className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#52525e] hover:text-[#3b82f6] uppercase tracking-widest transition-colors group"
                >
                  <Sparkles size={14} className="group-hover:animate-pulse" />
                  Apply Demo Signature
                </button>
            </div>

            <div className="space-y-6 pt-4">
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em]">
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
                      className="w-full h-16 bg-[#161621] border border-[#2e2e40] rounded-2xl px-6 text-[#f0f0f5] font-bold text-[18px] placeholder:text-[#2a2a3c] focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10 outline-none transition-all"
                    />
                </div>

                <div className={cn("space-y-4 transition-all duration-500", mode === "manual" ? "opacity-30 grayscale pointer-events-none scale-[0.98]" : "opacity-100")}>
                    <label className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em]">
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
                          className="w-full h-16 bg-[#161621] border border-[#2e2e40] rounded-2xl px-6 text-[#f0f0f5] font-mono text-[16px] placeholder:text-[#2a2a3c] focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10 outline-none transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                             <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="p-2 text-[#52525e] cursor-help">
                                        <Info size={18} />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-[#1e1e2c] border-[#2a2a3c] text-white">
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
                "w-full h-20 rounded-[32px] flex items-center justify-center gap-4 text-[18px] font-bold uppercase tracking-widest transition-all shadow-2xl",
                loading ? "bg-[#1e1e2c] text-[#52525e]" : "bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-[#3b82f6]/20"
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
