"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GuardrailsInput } from "./GuardrailsInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, AlertCircle, Plus, Trash2, FileText, Shield, Target, Briefcase, Activity, Terminal, Database, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClaimDraft {
  id?: string;
  text: string;
  source_url?: string;
}

interface ReviewAndEditGeneratedProps {
  agencyProfileId: Id<"agency_profile">;
  mode?: "manual" | "automated";
  initialSummary?: string;
  initialCoreOffer?: string;
  initialClaims?: ClaimDraft[];
  initialGuardrails?: string[];
  onSaved: () => void;
}

export function ReviewAndEditGenerated({ 
  agencyProfileId,
  mode = "automated",
  initialSummary = "",
  initialCoreOffer = "",
  initialClaims = [],
  initialGuardrails = [],
  onSaved 
}: ReviewAndEditGeneratedProps) {
  const saveReviewed = useMutation(api.sellerBrain.saveReviewedContentPublic);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [summary, setSummary] = useState(initialSummary);
  const [coreOffer, setCoreOffer] = useState(initialCoreOffer);
  const [claims, setClaims] = useState<ClaimDraft[]>(initialClaims);
  const [guardrails, setGuardrails] = useState<string[]>(initialGuardrails);
  
  // New claim form state
  const [newClaimText, setNewClaimText] = useState("");
  const [newClaimSourceUrl, setNewClaimSourceUrl] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; index?: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!summary.trim()) throw new Error("Please provide a summary.");
      if (!coreOffer.trim()) throw new Error("Please describe your core offer.");

      const formattedClaims = claims.map((claim, index) => ({
        id: claim.id || `claim_${index + 1}`,
        text: claim.text,
        source_url: claim.source_url || "",
      }));

      await saveReviewed({
        agencyProfileId,
        summary: summary.trim(),
        coreOffer: coreOffer.trim(),
        claims: formattedClaims,
        guardrails,
      });

      toast.success("Agency profile saved!");
      onSaved();
    } catch (err: unknown) {
      const message = typeof err === "object" && err && "message" in err
        ? String((err as { message?: unknown }).message)
        : null;
      setError(message ?? "Error: Could not save your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClaim = () => {
    if (!newClaimText.trim()) return;
    
    const newClaim: ClaimDraft = {
      id: `claim_${claims.length + 1}`,
      text: newClaimText.trim(),
      source_url: newClaimSourceUrl.trim() || undefined,
    };
    
    setClaims([...claims, newClaim]);
    setNewClaimText("");
    setNewClaimSourceUrl("");
    toast.success("Entry added");
  };

  const handleEditClaim = (index: number, field: keyof ClaimDraft, value: string) => {
    const updatedClaims = [...claims];
    updatedClaims[index] = { ...updatedClaims[index], [field]: value };
    setClaims(updatedClaims);
  };

  const handleRemoveClaim = (index: number) => {
    setClaims(claims.filter((_, i) => i !== index));
    setDeleteTarget(null);
    toast.success("Entry removed");
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[40px] p-8 md:p-12 mb-10 shadow-2xl ring-1 ring-white/5 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#3b82f6] to-transparent opacity-50" />
        <div className="flex items-center justify-center gap-2 mb-4">
            <Activity size={16} className="text-[#3b82f6]" />
            <span className="text-[12px] font-mono font-bold text-[#3b82f6] uppercase tracking-[0.2em]">Protocol Review Suite</span>
        </div>
        <h1 className="text-[32px] md:text-[42px] font-bold text-[#f0f0f5] tracking-tight mb-4">
          Verify Logic Synthesis
        </h1>
        <p className="text-[#9ca3b4] text-[16px] md:text-[18px] max-w-2xl mx-auto">
          Audit the generated cognitive models and factual datasets. All entries serve as primary operational weights for your AI agent.
        </p>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="mb-10 bg-red-400/5 border-red-400/20 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertDescription className="text-[12px] font-mono font-bold uppercase tracking-widest text-red-400 ml-3">
            LOGIC_FAULT: {error}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-10 pb-32">
        <Tabs defaultValue="overview" className="space-y-10">
          <TabsList className="flex items-center justify-center bg-[#161621] border border-[#2a2a3c] p-1.5 rounded-full w-fit mx-auto h-auto">
            <TabsTrigger 
                value="overview" 
                className="px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white transition-all gap-2"
            >
              <Briefcase size={14} />
              Strategic_Hub
            </TabsTrigger>
            <TabsTrigger 
                value="content" 
                className="px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white transition-all gap-2"
            >
              <Shield size={14} />
              Tactical_Grid
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 outline-none">
            <div className="grid grid-cols-1 gap-8">
              {/* Summary Section */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[32px] p-8 ring-1 ring-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-[#161621] border border-[#2a2a3c] rounded-2xl">
                    <FileText className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-[#f0f0f5]">Core Summary</h2>
                    <p className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-widest">Business Cognitive Model</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em] px-1">Synthesis_Input</Label>
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Enter business synthesis..."
                    rows={6}
                    required
                    className="bg-[#161621] border-[#2e2e40] rounded-2xl text-[14px] text-[#f0f0f5] placeholder:text-[#52525e] focus:border-[#3b82f6]/50 focus:ring-4 focus:ring-[#3b82f6]/10 transition-all font-mono leading-relaxed p-6"
                  />
                </div>
              </motion.div>

              {/* Core Offer Section */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[32px] p-8 ring-1 ring-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-[#161621] border border-[#2a2a3c] rounded-2xl">
                    <Target className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-[#f0f0f5]">Value Proposition</h2>
                    <p className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-widest">Conversion Anchor Logic</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em] px-1">Offer_Mapping</Label>
                  <Textarea
                    value={coreOffer}
                    onChange={(e) => setCoreOffer(e.target.value)}
                    placeholder="Describe core offering..."
                    rows={4}
                    required
                    className="bg-[#161621] border-[#2e2e40] rounded-2xl text-[14px] text-[#f0f0f5] placeholder:text-[#52525e] focus:border-[#3b82f6]/50 focus:ring-4 focus:ring-[#3b82f6]/10 transition-all font-mono leading-relaxed p-6"
                  />
                </div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-8 outline-none">
            {/* Guardrails Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[32px] p-8 ring-1 ring-white/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-[#161621] border border-[#2a2a3c] rounded-2xl">
                  <Shield className="h-5 w-5 text-[#3b82f6]" />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#f0f0f5]">Protocol Constraints</h2>
                  <p className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-widest">Cognitive Filter Overrides</p>
                </div>
              </div>
              <GuardrailsInput guardrails={guardrails} onGuardrailsChange={setGuardrails} />
            </motion.div>

            {/* Claims Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[32px] p-8 ring-1 ring-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#161621] border border-[#2a2a3c] rounded-2xl">
                    <Database className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-[#f0f0f5]">Verification Records</h2>
                    <p className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-widest">Factual Evidence Dataset</p>
                  </div>
                </div>
                {claims.length > 0 && (
                  <Badge className="bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1">
                    {claims.length}_RECORDS_LOADED
                  </Badge>
                )}
              </div>

              {/* Existing Claims */}
              <div className="space-y-4 mb-8">
                <AnimatePresence>
                  {claims.map((claim, index) => (
                    <motion.div 
                        key={claim.id || index} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="group relative bg-[#161621]/40 border border-[#2e2e40] rounded-2xl p-6 hover:border-[#3b82f6]/30 transition-all ring-1 ring-white/5"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-[#1e1e2c] border border-[#2a2a3c] text-[9px] font-mono font-bold text-[#52525e] uppercase tracking-widest">
                          <Terminal size={10} />
                          DATA_NODE_0{index + 1}
                        </div>
                        
                        <AlertDialog open={deleteTarget?.type === 'claim' && deleteTarget?.index === index} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget({ type: 'claim', index })}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#1e1e2c] border-[#2a2a3c] rounded-[32px] p-8 ring-1 ring-white/10">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-[24px] font-bold text-[#f0f0f5]">Purge Record?</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#9ca3b4] text-[15px]">
                                This action will remove this empirical data point from the cognitive model. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-8">
                              <AlertDialogCancel className="bg-transparent border-[#2a2a3c] text-[#f0f0f5] hover:bg-[#161621] rounded-2xl">Abort</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveClaim(index)} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl border-none">
                                Confirm Purge
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-[10px] font-mono font-bold text-[#52525e] uppercase tracking-widest mb-2 block">Value Proposition</Label>
                          <Textarea
                            value={claim.text}
                            onChange={(e) => handleEditClaim(index, "text", e.target.value)}
                            rows={2}
                            required
                            className="bg-[#161621] border-[#2a2a3c] rounded-xl text-[13px] text-[#f0f0f5] font-mono focus:border-[#3b82f6]/40 p-4 transition-all"
                          />
                        </div>
                        
                        {mode !== "manual" && (
                          <div className="relative">
                            <Label className="text-[10px] font-mono font-bold text-[#52525e] uppercase tracking-widest mb-2 block">Source Link (Optional)</Label>
                            <div className="relative group/input">
                                <Activity size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525e] group-focus-within/input:text-[#3b82f6] transition-colors" />
                                <Input
                                  type="url"
                                  value={claim.source_url || ""}
                                  onChange={(e) => handleEditClaim(index, "source_url", e.target.value)}
                                  placeholder="https://..."
                                  className="pl-10 h-11 bg-[#161621] border-[#2a2a3c] rounded-xl text-[12px] text-[#3b82f6] font-mono focus:border-[#3b82f6]/40 transition-all"
                                />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add New Claim */}
              <div className="bg-[#161621]/30 border border-dashed border-[#2a2a3c] rounded-[32px] p-8 hover:bg-[#161621]/50 transition-all">
                <div className="flex items-center gap-2 mb-6">
                    <Plus className="h-4 w-4 text-[#3b82f6]" />
                    <h3 className="text-[14px] font-mono font-bold text-[#f0f0f5] uppercase tracking-widest">Add New Claim</h3>
                </div>
                
                <div className="space-y-4">
                    <Textarea
                      value={newClaimText}
                      onChange={(e) => setNewClaimText(e.target.value)}
                      placeholder="e.g., We successfully scaled 50+ enterprise nodes..."
                      rows={2}
                      className="bg-[#1a1a26] border-[#2a2a3c] rounded-xl text-[13px] text-[#f0f0f5] font-mono focus:border-[#3b82f6]/40 p-4 transition-all"
                    />
                    
                    {mode !== "manual" && (
                      <Input
                        type="url"
                        value={newClaimSourceUrl}
                        onChange={(e) => setNewClaimSourceUrl(e.target.value)}
                        placeholder="Source URL (e.g., Case Study Link)"
                        className="h-11 bg-[#1a1a26] border-[#2a2a3c] rounded-xl text-[12px] text-[#f0f0f5] font-mono focus:border-[#3b82f6]/40 transition-all"
                      />
                    )}
                    
                    <Button
                      type="button"
                      onClick={handleAddClaim}
                      disabled={!newClaimText.trim()}
                      className="w-full sm:w-auto px-8 bg-[#1e1e2c] border border-[#2a2a3c] text-[12px] font-mono font-bold uppercase tracking-widest hover:bg-[#3b82f6] hover:text-white hover:border-[#3b82f6] transition-all rounded-xl"
                    >
                      Add Entry
                    </Button>
                </div>
              </div>

              {claims.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-[#52525e]">
                    <ShieldCheck size={24} className="mb-2 opacity-20" />
                    <p className="text-[11px] font-mono uppercase tracking-[0.2em] animate-pulse">Waiting for evidence payload...</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Action Bar */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50"
        >
            <div className="bg-[#1e1e2c]/80 backdrop-blur-xl border border-white/10 rounded-full p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                <Button
                    type="submit"
                    disabled={loading || !summary.trim() || !coreOffer.trim()}
                    className="w-full h-16 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-full text-[16px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#3b82f6]/30 group relative overflow-hidden transition-all"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        SAVING_PROFILE...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Zap size={18} className="text-white fill-white" />
                        Confirm & Continue
                        <ArrowRight className="h-5 w-5 ml-1 animate-pulse" />
                      </div>
                    )}
                </Button>
            </div>
        </motion.div>
      </form>
    </div>
  );
}
