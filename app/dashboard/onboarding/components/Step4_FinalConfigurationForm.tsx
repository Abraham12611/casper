"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { 
  TONE_OPTIONS, 
  TARGET_VERTICALS, 
  LEAD_QUALIFICATION_OPTIONS,
  NA_TIMEZONES, 
  DAYS
} from "../constants/formOptions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, AlertCircle, Plus, MessageSquare, Target, Clock, Trash2, Shield, Zap, Globe, Cpu, Activity, Terminal, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step4FinalConfigurationFormProps {
  mode?: "manual" | "automated";
  onComplete: () => void;
}

export function Step4FinalConfigurationForm({ 
  mode = "automated", // eslint-disable-line @typescript-eslint/no-unused-vars
  onComplete 
}: Step4FinalConfigurationFormProps) {
  const finalizeOnboarding = useMutation(api.sellerBrain.finalizeOnboardingPublic);
  const agencyProfile = useQuery(api.sellerBrain.getForCurrentUser);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [tone, setTone] = useState<string>("consultative");
  const [targetVertical, setTargetVertical] = useState<string>("");
  const [targetGeography, setTargetGeography] = useState<string>("");
  const [leadQualificationCriteria, setLeadQualificationCriteria] = useState<string[]>([]);
  const [timeZone, setTimeZone] = useState<string>("America/Los_Angeles");
  
  // Availability state
  const [availabilityDay, setAvailabilityDay] = useState<string>("Tue");
  const [availabilityStart, setAvailabilityStart] = useState("10:00");
  const [availabilityEnd, setAvailabilityEnd] = useState("12:00");
  const [availabilitySlots, setAvailabilitySlots] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; value?: string } | null>(null);

  // Form validation
  const isFormValid = 
    targetVertical.trim() !== "" &&
    targetGeography.trim() !== "" &&
    leadQualificationCriteria.length > 0 &&
    availabilitySlots.length > 0 &&
    (agencyProfile?.coreOffer?.trim() || "") !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!targetVertical) throw new Error("Target vertical required.");
      if (!targetGeography.trim()) throw new Error("Target geography required.");
      if (leadQualificationCriteria.length === 0) throw new Error("Lead qualification criteria required.");
      if (availabilitySlots.length === 0) throw new Error("Availability slots required.");

      const approvedClaims = agencyProfile?.approvedClaims || [];
      const guardrails = agencyProfile?.guardrails || [];
      const coreOffer = agencyProfile?.coreOffer?.trim() || "";
      if (!coreOffer) throw new Error("Missing core offer. Reset to Step 3.");

      await finalizeOnboarding({
        approvedClaims,
        guardrails,
        tone,
        targetVertical,
        targetGeography: targetGeography.trim(),
        coreOffer,
        leadQualificationCriteria,
        timeZone,
        availability: availabilitySlots,
      });

      toast.success("Agency setup complete! Redirecting to dashboard...");
      onComplete();
    } catch (err: unknown) {
      const message = typeof err === "object" && err && "message" in err
        ? String((err as { message?: unknown }).message)
        : null;
      setError(message ?? "Could not complete setup. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAvailabilitySlot = () => {
    if (!availabilityStart || !availabilityEnd) return;
    const slot = `${availabilityDay} ${availabilityStart}-${availabilityEnd}`;
    if (!availabilitySlots.includes(slot)) {
      setAvailabilitySlots([...availabilitySlots, slot]);
      toast.success("Availability added");
    } else {
      toast.info("Slot already exists");
    }
  };

  const handleRemoveAvailabilitySlot = (slotToRemove: string) => {
    setAvailabilitySlots(availabilitySlots.filter(slot => slot !== slotToRemove));
    setDeleteTarget(null);
    toast.success("Availability removed");
  };

  const handleQualificationCriteriaToggle = (criteria: string) => {
    setLeadQualificationCriteria(prev => 
      prev.includes(criteria) 
        ? prev.filter(c => c !== criteria)
        : [...prev, criteria]
    );
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-0 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[40px] p-8 md:p-12 mb-10 shadow-2xl ring-1 ring-white/5 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#3b82f6] to-transparent opacity-50" />
        <div className="flex items-center justify-center gap-2 mb-4">
            <Cpu size={16} className="text-[#3b82f6]" />
            <span className="text-[12px] font-mono font-bold text-[#3b82f6] uppercase tracking-[0.2em]">Operational Deployment Suite</span>
        </div>
        <h1 className="text-[32px] md:text-[42px] font-bold text-[#f0f0f5] tracking-tight mb-4">
          Final Calibration
        </h1>
        <p className="text-[#9ca3b4] text-[16px] md:text-[18px] max-w-2xl mx-auto">
          Configure the agent&apos;s linguistic profile, strategic target nodes, and operational window for real-time engagement.
        </p>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="mb-10 bg-red-400/5 border-red-400/20 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <AlertDescription className="text-[12px] font-mono font-bold uppercase tracking-widest text-red-400 ml-3">
            DEPLOY_FAULT: {error}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tone Selection */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[32px] p-8 ring-1 ring-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-[#161621] border border-[#2a2a3c] rounded-2xl">
              <MessageSquare className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#f0f0f5]">Linguistic Profile</h2>
              <p className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-widest">Verbal Synthesis Modulation</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em] px-1">Tone_Select</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="h-14 bg-[#161621] border-[#2e2e40] rounded-2xl text-[14px] text-[#f0f0f5] focus:ring-[#3b82f6]/10 font-mono transition-all">
                <SelectValue placeholder="Select modulation..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e2c] border-[#2a2a3c] text-white rounded-2xl overflow-hidden ring-1 ring-white/10">
                {TONE_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="px-6 py-3 cursor-pointer hover:bg-[#3b82f6] transition-colors focus:bg-[#3b82f6] uppercase text-[12px] font-mono font-bold tracking-widest">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Target Market Configuration */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[32px] p-8 ring-1 ring-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-[#161621] border border-[#2a2a3c] rounded-2xl">
              <Target className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#f0f0f5]">Strategic Focus</h2>
              <p className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-widest">Network Topology Targeting</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em] px-1">Your Industry Niche</Label>
              <Select value={targetVertical} onValueChange={setTargetVertical} required>
                <SelectTrigger className="h-14 bg-[#161621] border-[#2e2e40] rounded-2xl text-[14px] text-[#f0f0f5] focus:ring-[#3b82f6]/10 font-mono transition-all">
                  <SelectValue placeholder="Industry node..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e2c] border-[#2a2a3c] text-white rounded-2xl overflow-hidden ring-1 ring-white/10">
                  {TARGET_VERTICALS.map(vertical => (
                    <SelectItem key={vertical} value={vertical} className="px-6 py-3 cursor-pointer hover:bg-[#3b82f6] transition-colors focus:bg-[#3b82f6] text-[12px] font-mono font-bold tracking-widest">
                        {vertical.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em] px-1">Where Your Clients Are</Label>
              <div className="relative group">
                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525e] group-focus-within:text-[#3b82f6] transition-colors" />
                <Input
                  type="text"
                  value={targetGeography}
                  onChange={(e) => setTargetGeography(e.target.value)}
                  placeholder="Node location (e.g., GLOBAL)"
                  className="pl-12 h-14 bg-[#161621] border-[#2e2e40] rounded-2xl text-[14px] text-[#f0f0f5] placeholder:text-[#52525e] focus:border-[#3b82f6]/50 transition-all font-mono"
                  required
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lead Qualification Criteria */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[32px] p-8 ring-1 ring-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#161621] border border-[#2a2a3c] rounded-2xl">
                <CheckCircle2 className="h-5 w-5 text-[#3b82f6]" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#f0f0f5]">Qualified Lead Criteria</h2>
                <p className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-widest">What your ideal client looks like</p>
              </div>
            </div>
            <Badge className="bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1">
              {leadQualificationCriteria.length}_CRITERIA_ACTIVE
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LEAD_QUALIFICATION_OPTIONS.map(option => (
              <label 
                key={option.value} 
                className={cn(
                    "group flex items-start gap-4 p-5 bg-[#161621]/40 border rounded-2xl cursor-pointer transition-all ring-1 ring-white/5",
                    leadQualificationCriteria.includes(option.value) 
                        ? "border-[#3b82f6]/50 bg-[#3b82f6]/5" 
                        : "border-[#2e2e40] hover:border-[#3b82f6]/30"
                )}
              >
                <Checkbox
                  checked={leadQualificationCriteria.includes(option.value)}
                  onCheckedChange={() => handleQualificationCriteriaToggle(option.value)}
                  className="mt-0.5 border-[#2e2e40] data-[state=checked]:bg-[#3b82f6] data-[state=checked]:border-[#3b82f6]"
                />
                <div className="space-y-1">
                    <span className="text-[13px] text-[#f0f0f5] font-bold group-hover:text-white transition-colors">{option.label}</span>
                    <p className="text-[10px] font-mono text-[#52525e] uppercase tracking-widest">Qualification_Check_0{LEAD_QUALIFICATION_OPTIONS.indexOf(option) + 1}</p>
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Timezone and Availability */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-[32px] p-8 ring-1 ring-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-[#161621] border border-[#2a2a3c] rounded-2xl">
              <Clock className="h-5 w-5 text-[#3b82f6]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#f0f0f5]">Sales Call Hours</h2>
              <p className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-widest">When you can take meetings</p>
            </div>
          </div>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <Label className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em] px-1">Temporal_Zone</Label>
              <Select value={timeZone} onValueChange={setTimeZone}>
                <SelectTrigger className="h-14 bg-[#161621] border-[#2e2e40] rounded-2xl text-[14px] text-[#f0f0f5] font-mono transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e2c] border-[#2a2a3c] text-white rounded-2xl overflow-hidden ring-1 ring-white/10 max-h-[300px]">
                  {NA_TIMEZONES.map(tz => (
                    <SelectItem key={tz} value={tz} className="px-6 py-3 cursor-pointer hover:bg-[#3b82f6] transition-colors focus:bg-[#3b82f6] text-[12px] font-mono">
                        {tz.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-[#2a2a3c]" />

            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em]">Weekly Slots</Label>
                <Badge variant="outline" className="border-[#3b82f6]/30 text-[#3b82f6] font-mono text-[10px] font-bold">
                  {availabilitySlots.length}_NODES
                </Badge>
              </div>
              
              <div className="p-8 border border-dashed border-[#2a2a3c] rounded-[32px] bg-[#161621]/30 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-mono font-bold text-[#52525e] uppercase tracking-widest px-1">Day</Label>
                    <Select value={availabilityDay} onValueChange={setAvailabilityDay}>
                      <SelectTrigger className="h-12 bg-[#1a1a26] border-[#2e2e40] rounded-xl text-[12px] font-mono text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e1e2c] border-[#2a2a3c] text-white rounded-xl">
                        {DAYS.map(day => (
                          <SelectItem key={day} value={day} className="font-mono text-[11px]">{day.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-mono font-bold text-[#52525e] uppercase tracking-widest px-1">Start Time</Label>
                    <Input
                      type="time"
                      value={availabilityStart}
                      onChange={(e) => setAvailabilityStart(e.target.value)}
                      className="h-12 bg-[#1a1a26] border-[#2e2e40] rounded-xl text-[12px] font-mono text-white focus:border-[#3b82f6]/40 transition-all p-4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-mono font-bold text-[#52525e] uppercase tracking-widest px-1">End Time</Label>
                    <Input
                      type="time"
                      value={availabilityEnd}
                      onChange={(e) => setAvailabilityEnd(e.target.value)}
                      className="h-12 bg-[#1a1a26] border-[#2e2e40] rounded-xl text-[12px] font-mono text-white focus:border-[#3b82f6]/40 transition-all p-4"
                    />
                  </div>
                </div>
                
                <Button
                  type="button"
                  onClick={handleAddAvailabilitySlot}
                  className="w-full h-12 bg-transparent border border-[#2a2a3c] hover:bg-[#1e1e2c] hover:border-[#3b82f6] text-[11px] font-mono font-bold text-[#9ca3b4] hover:text-white uppercase tracking-widest transition-all rounded-xl gap-2"
                >
                  <Plus size={14} />
                  Register_Time_Node
                </Button>
              </div>

              {availabilitySlots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                      {availabilitySlots.map((slot, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="group flex items-center gap-3 bg-[#1e1e2c] border border-[#2a2a3c] rounded-xl px-4 py-2 hover:border-[#3b82f6]/30 transition-all ring-1 ring-white/5"
                        >
                          <Activity size={12} className="text-[#3b82f6] opacity-50" />
                          <span className="text-[12px] font-mono font-bold text-[#f0f0f5] uppercase tracking-tight">{slot}</span>
                          <AlertDialog open={deleteTarget?.type === 'slot' && deleteTarget?.value === slot} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteTarget({ type: 'slot', value: slot })}
                                className="h-6 w-6 p-0 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                              >
                                <Trash2 size={12} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#1e1e2c] border-[#2a2a3c] rounded-[32px] p-8">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-[24px] font-bold text-white">Purge Time Node?</AlertDialogTitle>
                                <AlertDialogDescription className="text-[#9ca3b4]">
                                  Remove the window &quot;{slot}&quot; from operational availability.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-8">
                                <AlertDialogCancel className="bg-transparent border-[#2a2a3c] text-white rounded-2xl">Abort</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveAvailabilitySlot(slot)} className="bg-red-500 hover:bg-red-600 text-white rounded-2xl border-none">Purge</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-[#52525e]">
                    <Clock size={24} className="mb-2 opacity-20" />
                    <p className="text-[11px] font-mono uppercase tracking-[0.2em] animate-pulse">Waiting for schedule cluster...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50"
        >
            <div className="bg-[#1e1e2c]/80 backdrop-blur-xl border border-white/10 rounded-full p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                <Button
                    type="submit"
                    disabled={loading || !isFormValid}
                    className="w-full h-16 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-full text-[16px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#3b82f6]/30 group relative overflow-hidden transition-all"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        CALIBRATING_CLUSTER...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Zap size={18} className="text-white fill-white" />
                        Deploy Strategic Agent
                        <CheckCircle2 size={18} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                </Button>
            </div>
        </motion.div>
      </form>
    </div>
  );
}
