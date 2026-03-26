"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { 
  Building2, 
  Target, 
  Shield, 
  CheckCircle2, 
  ExternalLink,
  FileText,
  Clock,
  Palette,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  Settings,
  Briefcase,
  Search,
  Zap,
  Fingerprint,
  Cpu,
  Database,
  Terminal,
  ArrowUpRight,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Constants
const TONE_OPTIONS = ["consultative", "professional", "friendly"];
const TARGET_VERTICALS = [
  "Roofing", "Plumbing", "Electricians", "HVAC", "Landscaping & Lawn Care",
  "Tree Services", "Pest Control", "Garage Door Services", "Solar Installers",
  "General Contractors & Remodeling", "Painting", "Cleaning Services",
  "Restoration (Water/Fire/Mold)", "Window Cleaning", "Pressure Washing",
  "Handyman", "Auto Repair", "Auto Body & Collision", "Tire Shops",
  "Dentists", "Chiropractors", "Physical Therapy", "Optometrists", "Med Spas",
  "Hair Salons & Barbers", "Law Firms", "Accountants & CPAs", "Real Estate Agents",
  "Property Management", "Mortgage Brokers"
];
const LEAD_QUALIFICATION_OPTIONS = [
  { value: "LOW_GOOGLE_RATING", label: "Low Google Rating" },
  { value: "FEW_GOOGLE_REVIEWS", label: "Few Google Reviews" },
  { value: "MISSING_WEBSITE", label: "Missing Website" },
  { value: "WEAK_WEB_PRESENCE", label: "Website is Social Profile Only" },
];
const NA_TIMEZONES = [
  "America/Los_Angeles", "America/Denver", "America/Phoenix", "America/Chicago",
  "America/New_York", "America/Anchorage", "America/Honolulu", "America/Toronto",
  "America/Vancouver", "America/Mexico_City"
];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ClaimDraft {
  id: string;
  text: string;
  source_url: string;
}

export default function AgencyPage() {
  const agencyProfile = useQuery(api.sellerBrain.getForCurrentUser);
  const updateProfile = useMutation(api.sellerBrain.updateAgencyProfile);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; index?: number; value?: string } | null>(null);

  // Edit form state
  const [editSummary, setEditSummary] = useState("");
  const [editCoreOffer, setEditCoreOffer] = useState("");
  const [editClaims, setEditClaims] = useState<ClaimDraft[]>([]);
  const [editGuardrails, setEditGuardrails] = useState<string[]>([]);
  const [editTone, setEditTone] = useState("");
  const [editTargetVertical, setEditTargetVertical] = useState("");
  const [editTargetGeography, setEditTargetGeography] = useState("");
  const [editLeadQualificationCriteria, setEditLeadQualificationCriteria] = useState<string[]>([]);
  const [editTimeZone, setEditTimeZone] = useState("");
  const [editAvailability, setEditAvailability] = useState<string[]>([]);

  const [availabilityDay, setAvailabilityDay] = useState("Tue");
  const [availabilityStart, setAvailabilityStart] = useState("10:00");
  const [availabilityEnd, setAvailabilityEnd] = useState("12:00");
  const [newClaimText, setNewClaimText] = useState("");
  const [newClaimSourceUrl, setNewClaimSourceUrl] = useState("");
  const [newGuardrailText, setNewGuardrailText] = useState("");

  if (agencyProfile === undefined) return <AgencyProfileSkeleton />;
  if (agencyProfile === null) return <EmptyAgencyProfile />;

  const handleStartEdit = (section: string) => {
    setEditSummary(agencyProfile.summary || "");
    setEditCoreOffer(agencyProfile.coreOffer || "");
    setEditClaims(agencyProfile.approvedClaims || []);
    setEditGuardrails(agencyProfile.guardrails || []);
    setEditTone(agencyProfile.tone || "consultative");
    setEditTargetVertical(agencyProfile.targetVertical || "");
    setEditTargetGeography(agencyProfile.targetGeography || "");
    setEditLeadQualificationCriteria(agencyProfile.leadQualificationCriteria || []);
    setEditTimeZone(agencyProfile.timeZone || "America/Los_Angeles");
    setEditAvailability(agencyProfile.availability || []);
    setEditingSection(section);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setError(null);
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      await updateProfile({
        summary: editSummary.trim(),
        coreOffer: editCoreOffer.trim(),
        approvedClaims: editClaims,
        guardrails: editGuardrails,
        tone: editTone,
        targetVertical: editTargetVertical,
        targetGeography: editTargetGeography.trim(),
        leadQualificationCriteria: editLeadQualificationCriteria,
        timeZone: editTimeZone,
        availability: editAvailability,
      });
      setEditingSection(null);
      toast.success("Intelligence Baseline Updated.");
    } catch (err: any) {
      const errorMsg = err.message || "Target acquisition rejected.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddClaim = () => {
    if (!newClaimText.trim()) return;
    setEditClaims([...editClaims, { id: `claim_${Date.now()}`, text: newClaimText.trim(), source_url: newClaimSourceUrl.trim() }]);
    setNewClaimText("");
    setNewClaimSourceUrl("");
    toast.success("Claim Cached");
  };

  const handleRemoveClaim = (index: number) => {
    setEditClaims(editClaims.filter((_, i) => i !== index));
    setDeleteTarget(null);
  };

  const handleEditClaim = (index: number, field: keyof ClaimDraft, value: string) => {
    const updated = [...editClaims];
    updated[index] = { ...updated[index], [field]: value };
    setEditClaims(updated);
  };

  const handleAddGuardrail = () => {
    if (!newGuardrailText.trim()) return;
    if (editGuardrails.includes(newGuardrailText.trim())) {
      setNewGuardrailText("");
      return;
    }
    setEditGuardrails([...editGuardrails, newGuardrailText.trim()]);
    setNewGuardrailText("");
    toast.success("Protocol Active");
  };

  const handleRemoveGuardrail = (guardrail: string) => {
    setEditGuardrails(editGuardrails.filter(g => g !== guardrail));
    setDeleteTarget(null);
  };

  const handleAddAvailabilitySlot = () => {
    if (!availabilityStart || !availabilityEnd) return;
    const slot = `${availabilityDay} ${availabilityStart}-${availabilityEnd}`;
    if (!editAvailability.includes(slot)) {
      setEditAvailability([...editAvailability, slot]);
      toast.success("Sync Node Enabled");
    }
  };

  const handleRemoveAvailabilitySlot = (slot: string) => {
    setEditAvailability(editAvailability.filter(s => s !== slot));
  };

  const handleQualificationCriteriaToggle = (criteria: string) => {
    setEditLeadQualificationCriteria(prev => 
      prev.includes(criteria) ? prev.filter(c => c !== criteria) : [...prev, criteria]
    );
  };

  return (
    <TooltipProvider>
      <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12">
        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
            <div className="space-y-2">
                <div className="flex items-center gap-3 mb-1">
                    <Fingerprint size={20} className="text-[#f97316]" />
                    <span className="text-[12px] font-mono font-bold text-[#f97316] uppercase tracking-[0.2em]">Entity Signature</span>
                </div>
                <h1 className="text-[32px] font-bold text-[#f0f0f5] tracking-tight">
                    Intelligence Baseline
                </h1>
                <p className="text-[#9ca3b4] text-[15px]">
                    Autonomous configuration for <span className="text-[#f0f0f5] font-medium">{agencyProfile.companyName}</span>.
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-[#1e1e2c] border border-[#2a2a3c] rounded-xl flex items-center gap-3 h-12 shadow-sm">
                    <Database size={14} className="text-[#3b82f6]" />
                    <span className="text-[12px] font-mono font-bold text-[#f0f0f5] uppercase tracking-wider">SECURE SYNC ACTIVE</span>
                </div>
            </div>
        </motion.div>

        {error && (
            <Alert variant="destructive" className="bg-[#ef4444]/10 border-[#ef4444]/30 rounded-2xl mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-[13px] font-mono">{error}</AlertDescription>
            </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="p-1 bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl w-full max-w-2xl h-14">
                <TabsTrigger value="overview" className="flex-1 h-12 rounded-xl text-[12px] font-bold uppercase tracking-widest cursor-pointer data-[state=active]:bg-[#26263a] data-[state=active]:text-[#f97316] gap-2 transition-all">
                    <Cpu size={14} />
                    Overview
                </TabsTrigger>
                <TabsTrigger value="content" className="flex-1 h-12 rounded-xl text-[12px] font-bold uppercase tracking-widest cursor-pointer data-[state=active]:bg-[#26263a] data-[state=active]:text-[#f97316] gap-2 transition-all">
                    <Terminal size={14} />
                    Security
                </TabsTrigger>
                <TabsTrigger value="targeting" className="flex-1 h-12 rounded-xl text-[12px] font-bold uppercase tracking-widest cursor-pointer data-[state=active]:bg-[#26263a] data-[state=active]:text-[#f97316] gap-2 transition-all">
                    <Target size={14} />
                    Targeting
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 h-12 rounded-xl text-[12px] font-bold uppercase tracking-widest cursor-pointer data-[state=active]:bg-[#26263a] data-[state=active]:text-[#f97316] gap-2 transition-all">
                    <Settings size={14} />
                    Config
                </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Company Summary */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-8 space-y-6 ring-1 ring-white/5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-[#f97316]" />
                                    <h3 className="text-[18px] font-bold text-[#f0f0f5]">Business Intelligence Summary</h3>
                                </div>
                                {editingSection !== 'summary' ? (
                                    <Button onClick={() => handleStartEdit('summary')} variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#26263a] text-[#52525e] hover:text-[#f0f0f5]">
                                        <Edit size={16} />
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="h-9 w-9 p-0 text-[#ef4444] hover:bg-[#ef4444]/10"><X size={16} /></Button>
                                        <Button onClick={handleSave} variant="ghost" size="sm" className="h-9 w-9 p-0 text-[#22c55e] hover:bg-[#22c55e]/10" disabled={isSaving}>
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            {editingSection === 'summary' ? (
                                <Textarea 
                                    value={editSummary} 
                                    onChange={(e) => setEditSummary(e.target.value)} 
                                    rows={8} 
                                    className="w-full bg-[#161621] border-[#2e2e40] rounded-2xl p-4 text-[14px] text-[#f0f0f5] focus:ring-1 focus:ring-[#f97316]/40 transition-all outline-none" 
                                />
                            ) : (
                                <p className="text-[14px] leading-relaxed text-[#9ca3b4] whitespace-pre-wrap">
                                    {agencyProfile.summary || "No data provided. Baseline is empty."}
                                </p>
                            )}
                        </motion.div>

                        {/* Core Offer */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-8 space-y-6 ring-1 ring-white/5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Target size={18} className="text-[#3b82f6]" />
                                    <h3 className="text-[18px] font-bold text-[#f0f0f5]">Value Proposition Baseline</h3>
                                </div>
                                {editingSection !== 'offer' ? (
                                    <Button onClick={() => handleStartEdit('offer')} variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#26263a] text-[#52525e] hover:text-[#f0f0f5]">
                                        <Edit size={16} />
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="h-9 w-9 p-0 text-[#ef4444] hover:bg-[#ef4444]/10"><X size={16} /></Button>
                                        <Button onClick={handleSave} variant="ghost" size="sm" className="h-9 w-9 p-0 text-[#22c55e] hover:bg-[#22c55e]/10" disabled={isSaving}>
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            {editingSection === 'offer' ? (
                                <Textarea 
                                    value={editCoreOffer} 
                                    onChange={(e) => setEditCoreOffer(e.target.value)} 
                                    rows={8} 
                                    className="w-full bg-[#161621] border-[#2e2e40] rounded-2xl p-4 text-[14px] text-[#f0f0f5] focus:ring-1 focus:ring-[#3b82f6]/40 transition-all outline-none" 
                                />
                            ) : (
                                <p className="text-[14px] leading-relaxed text-[#9ca3b4] whitespace-pre-wrap">
                                    {agencyProfile.coreOffer || "No value prop defined. Mapping pending."}
                                </p>
                            )}
                        </motion.div>
                    </div>
                </TabsContent>

                {/* Security/Protocol Tab */}
                <TabsContent value="content" className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        {/* Guardrails */}
                        <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-8 space-y-6 ring-1 ring-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield size={18} className="text-[#ea580c]" />
                                    <h3 className="text-[18px] font-bold text-[#f0f0f5]">Operation Guardrails</h3>
                                </div>
                                {editingSection !== 'guardrails' ? (
                                    <Button onClick={() => handleStartEdit('guardrails')} variant="ghost" size="sm" className="h-9 rounded-xl border border-[#2e2e40] px-4 text-[12px] font-bold uppercase tracking-widest hover:text-[#f97316]">
                                        Modify Registry
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} variant="ghost" className="h-9 rounded-xl px-4 text-[#22c55e] hover:bg-[#22c55e]/10 uppercase text-[12px] font-bold tracking-widest" disabled={isSaving}>
                                            Commit Protocols
                                        </Button>
                                        <Button onClick={handleCancelEdit} variant="ghost" className="h-9 rounded-xl px-4 text-[#ef4444] hover:bg-[#ef4444]/10 uppercase text-[12px] font-bold tracking-widest">Abort</Button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(editingSection === 'guardrails' ? editGuardrails : (agencyProfile.guardrails || [])).map((g, i) => (
                                    <motion.div 
                                        key={i}
                                        className="p-4 bg-[#161621] border border-[#2e2e40] rounded-2xl flex items-center justify-between group transition-all hover:border-[#ea580c]/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-[#26263a] flex items-center justify-center text-[#ea580c]">
                                                <Shield size={14} />
                                            </div>
                                            <span className="text-[13px] text-[#f0f0f5] font-medium leading-relaxed">{g}</span>
                                        </div>
                                        {editingSection === 'guardrails' && (
                                            <Button 
                                                onClick={() => handleRemoveGuardrail(g)} 
                                                variant="ghost" 
                                                className="h-8 w-8 p-0 text-[#52525e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        )}
                                    </motion.div>
                                ))}
                                {editingSection === 'guardrails' && (
                                    <div className="md:col-span-2 flex gap-3 mt-4">
                                        <Input 
                                            value={newGuardrailText} 
                                            onChange={(e) => setNewGuardrailText(e.target.value)}
                                            placeholder="Enter new operation guardrail..."
                                            className="h-12 bg-[#161621] border-[#2e2e40] rounded-xl text-[13px] focus:ring-1 focus:ring-[#ea580c]/40 outline-none flex-1"
                                        />
                                        <Button onClick={handleAddGuardrail} variant="outline" className="h-12 px-6 rounded-xl border-[#2e2e40] bg-[#22222e] text-[#f0f0f5] hover:bg-[#26263a]">
                                            <Plus size={16} className="mr-2" />
                                            Add Protocol
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Claims */}
                        <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-8 space-y-6 ring-1 ring-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={18} className="text-[#22c55e]" />
                                    <h3 className="text-[18px] font-bold text-[#f0f0f5]">Approved Verification Claims</h3>
                                </div>
                                {editingSection !== 'claims' ? (
                                    <Button onClick={() => handleStartEdit('claims')} variant="ghost" size="sm" className="h-9 rounded-xl border border-[#2e2e40] px-4 text-[12px] font-bold uppercase tracking-widest hover:text-[#22c55e]">
                                        Update Evidence
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} variant="ghost" className="h-9 rounded-xl px-4 text-[#22c55e] hover:bg-[#22c55e]/10 uppercase text-[12px] font-bold tracking-widest" disabled={isSaving}>
                                            Save Evidence
                                        </Button>
                                        <Button onClick={handleCancelEdit} variant="ghost" className="h-9 rounded-xl px-4 text-[#ef4444] hover:bg-[#ef4444]/10 uppercase text-[12px] font-bold tracking-widest">Abort</Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {(editingSection === 'claims' ? editClaims : (agencyProfile.approvedClaims || [])).map((claim: any, i: number) => (
                                    <div key={claim.id || i} className="p-5 bg-[#161621] border border-[#2e2e40] rounded-2xl space-y-3 group hover:border-[#22c55e]/40 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20 text-[10px] uppercase font-mono tracking-widest">ID #{String(i + 1).padStart(2, '0')}</Badge>
                                                {claim.source_url && (
                                                    <a href={claim.source_url} target="_blank" className="text-[10px] text-[#52525e] hover:text-[#3b82f6] flex items-center gap-1 font-mono uppercase tracking-widest">
                                                        <ExternalLink size={10} /> Link Verified
                                                    </a>
                                                )}
                                            </div>
                                            {editingSection === 'claims' && (
                                                <Button onClick={() => handleRemoveClaim(i)} variant="ghost" className="h-8 w-8 p-0 text-[#52525e] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg">
                                                    <Trash2 size={14} />
                                                </Button>
                                            )}
                                        </div>
                                        {editingSection === 'claims' ? (
                                            <div className="space-y-3">
                                                <Textarea 
                                                    value={claim.text} 
                                                    onChange={(e) => handleEditClaim(i, "text", e.target.value)}
                                                    className="w-full bg-[#0d0d13] border-[#2e2e40] rounded-xl p-3 text-[13px] text-[#f0f0f5] outline-none"
                                                    rows={2}
                                                />
                                                <Input 
                                                    value={claim.source_url || ""} 
                                                    onChange={(e) => handleEditClaim(i, "source_url", e.target.value)}
                                                    placeholder="Source Verification URL"
                                                    className="h-10 bg-[#0d0d13] border-[#2e2e40] rounded-xl text-[12px]"
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-[14px] leading-relaxed text-[#f0f0f5]">{claim.text}</p>
                                        )}
                                    </div>
                                ))}
                                {editingSection === 'claims' && (
                                    <div className="p-6 bg-[#22222e] border border-dashed border-[#22c55e]/30 rounded-3xl space-y-4">
                                        <h4 className="text-[14px] font-bold text-[#f0f0f5] mb-2 flex items-center gap-2"><Plus size={16} /> New Evidence Chain</h4>
                                        <Textarea 
                                            value={newClaimText} 
                                            onChange={(e) => setNewClaimText(e.target.value)}
                                            placeholder="Enter business claim text..."
                                            className="w-full bg-[#161621] border-[#2e2e40] rounded-xl p-4 text-[13px] outline-none"
                                            rows={3}
                                        />
                                        <div className="flex gap-4">
                                            <Input 
                                                value={newClaimSourceUrl} 
                                                onChange={(e) => setNewClaimSourceUrl(e.target.value)}
                                                placeholder="Verification URL (optional)"
                                                className="h-11 bg-[#161621] border-[#2e2e40] rounded-xl text-[13px] flex-1"
                                            />
                                            <Button onClick={handleAddClaim} disabled={!newClaimText.trim()} className="h-11 px-6 bg-[#22c55e] text-[#0d0d13] hover:bg-[#22c55e]/90 rounded-xl font-bold">
                                                Append Claim
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Targeting Tab */}
                <TabsContent value="targeting" className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-8 space-y-8 ring-1 ring-white/5"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Target size={18} className="text-[#3b82f6]" />
                                <h3 className="text-[18px] font-bold text-[#f0f0f5]">Mapping Protocols</h3>
                            </div>
                            {editingSection !== 'targeting' ? (
                                <Button onClick={() => handleStartEdit('targeting')} variant="ghost" size="sm" className="h-9 rounded-xl border border-[#2e2e40] px-4 text-[12px] font-bold uppercase tracking-widest hover:text-[#3b82f6]">
                                    Modify Targets
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} variant="ghost" className="h-9 rounded-xl px-4 text-[#22c55e] hover:bg-[#22c55e]/10 uppercase text-[12px] font-bold tracking-widest" disabled={isSaving}>
                                        Commit Target
                                    </Button>
                                    <Button onClick={handleCancelEdit} variant="ghost" className="h-9 rounded-xl px-4 text-[#ef4444] hover:bg-[#ef4444]/10 uppercase text-[12px] font-bold tracking-widest">Abort</Button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest block mb-4">Focus Vertical</label>
                                    {editingSection === 'targeting' ? (
                                        <Select value={editTargetVertical} onValueChange={setEditTargetVertical}>
                                            <SelectTrigger className="h-12 bg-[#161621] border-[#2e2e40] rounded-xl text-[#f0f0f5]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1e1e2c] border-[#2a2a3c] text-[#f0f0f5]">
                                                {TARGET_VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="p-4 bg-[#161621] border border-[#2e2e40] rounded-2xl flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#f0f0f5]">{agencyProfile.targetVertical || "General"}</span>
                                            <ArrowUpRight size={14} className="text-[#3b82f6]" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest block mb-4">Tactical Geography</label>
                                    {editingSection === 'targeting' ? (
                                        <Input 
                                            value={editTargetGeography} 
                                            onChange={(e) => setEditTargetGeography(e.target.value)}
                                            placeholder="e.g. Dallas, TX" 
                                            className="h-12 bg-[#161621] border-[#2e2e40] rounded-xl"
                                        />
                                    ) : (
                                        <div className="p-4 bg-[#161621] border border-[#2e2e40] rounded-2xl flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#f0f0f5]">{agencyProfile.targetGeography || "Global Operations"}</span>
                                            <MapPin size={14} className="text-[#f97316]" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest block mb-4">Inclusion Criteria</label>
                                <div className="space-y-3">
                                    {LEAD_QUALIFICATION_OPTIONS.map(opt => (
                                        <label 
                                            key={opt.value} 
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                                (editingSection === 'targeting' ? editLeadQualificationCriteria.includes(opt.value) : agencyProfile.leadQualificationCriteria?.includes(opt.value))
                                                    ? "bg-[#3b82f6]/5 border-[#3b82f6]/40 text-[#f0f0f5]" 
                                                    : "bg-[#161621] border-[#2e2e40] text-[#6b7280] opacity-60"
                                            )}
                                        >
                                            <Checkbox 
                                                checked={editingSection === 'targeting' ? editLeadQualificationCriteria.includes(opt.value) : agencyProfile.leadQualificationCriteria?.includes(opt.value)} 
                                                onCheckedChange={() => editingSection === 'targeting' && handleQualificationCriteriaToggle(opt.value)}
                                                disabled={editingSection !== 'targeting'}
                                                className="border-[#2a2a3c] data-[state=checked]:bg-[#3b82f6]"
                                            />
                                            <span className="text-[13px] font-medium tracking-tight">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>

                {/* Settings/Config Tab */}
                <TabsContent value="settings" className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-8 space-y-8 ring-1 ring-white/5"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Palette size={18} className="text-[#f97316]" />
                                <h3 className="text-[18px] font-bold text-[#f0f0f5]">Signal Configuration</h3>
                            </div>
                            {editingSection !== 'settings' ? (
                                <Button onClick={() => handleStartEdit('settings')} variant="ghost" size="sm" className="h-9 rounded-xl border border-[#2e2e40] px-4 text-[12px] font-bold uppercase tracking-widest hover:text-[#f97316]">
                                    Modify Tuning
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} variant="ghost" className="h-9 rounded-xl px-4 text-[#22c55e] hover:bg-[#22c55e]/10 uppercase text-[12px] font-bold tracking-widest" disabled={isSaving}>
                                        Commit Tuning
                                    </Button>
                                    <Button onClick={handleCancelEdit} variant="ghost" className="h-9 rounded-xl px-4 text-[#ef4444] hover:bg-[#ef4444]/10 uppercase text-[12px] font-bold tracking-widest">Abort</Button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest block mb-4">Voice Tone Architecture</label>
                                    {editingSection === 'settings' ? (
                                        <Select value={editTone} onValueChange={setEditTone}>
                                            <SelectTrigger className="h-12 bg-[#161621] border-[#2e2e40] rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>{TONE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="p-4 bg-[#161621] border border-[#2e2e40] rounded-2xl flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#f0f0f5] capitalize">{agencyProfile.tone || "Professional"}</span>
                                            <Zap size={14} className="text-[#f97316]" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest block mb-4">Operational Temporal Zone</label>
                                    {editingSection === 'settings' ? (
                                        <Select value={editTimeZone} onValueChange={setEditTimeZone}>
                                            <SelectTrigger className="h-12 bg-[#161621] border-[#2e2e40] rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>{NA_TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="p-4 bg-[#161621] border border-[#2e2e40] rounded-2xl flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#f0f0f5]">{agencyProfile.timeZone || "UTC-8"}</span>
                                            <Clock size={14} className="text-[#3b82f6]" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[11px] font-bold text-[#6b7280] uppercase tracking-widest block mb-4">Sync Capacity Nodes</label>
                                <div className="grid grid-cols-1 gap-6">
                                    {editingSection === 'settings' && (
                                        <div className="p-6 bg-[#161621] border border-dashed border-[#2e2e40] rounded-3xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-[#52525e] font-bold uppercase">Target Day</label>
                                                <Select value={availabilityDay} onValueChange={setAvailabilityDay}>
                                                    <SelectTrigger className="h-10 bg-[#0d0d13] border-[#2e2e40] rounded-xl"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-[#52525e] font-bold uppercase">Initiate</label>
                                                <Input type="time" value={availabilityStart} onChange={(e) => setAvailabilityStart(e.target.value)} className="h-10 bg-[#0d0d13] border-[#2e2e40] rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-[#52525e] font-bold uppercase">Terminate</label>
                                                <Input type="time" value={availabilityEnd} onChange={(e) => setAvailabilityEnd(e.target.value)} className="h-10 bg-[#0d0d13] border-[#2e2e40] rounded-xl" />
                                            </div>
                                            <Button onClick={handleAddAvailabilitySlot} variant="outline" className="h-10 rounded-xl border-[#2e2e40] bg-[#1a1a26] text-[#f0f0f5] font-bold">Add Node</Button>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {(editingSection === 'settings' ? editAvailability : (agencyProfile.availability || [])).map((slot, i) => (
                                            <div key={i} className="px-4 py-2 bg-[#161621] border border-[#2e2e40] rounded-xl flex items-center gap-3 transition-all hover:border-[#f97316]/50">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                                <span className="text-[13px] font-mono text-[#f0f0f5] font-medium">{slot}</span>
                                                {editingSection === 'settings' && (
                                                    <Button onClick={() => handleRemoveAvailabilitySlot(slot)} variant="ghost" className="h-6 w-6 p-0 text-[#ef4444] hover:bg-[#ef4444]/10 rounded">
                                                        <Trash2 size={12} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </TabsContent>
            </AnimatePresence>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function AgencyProfileSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12 animate-pulse">
        <div className="h-24 w-1/3 bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px]" />
        <div className="h-14 w-full max-w-2xl bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl" />
        <div className="grid grid-cols-2 gap-8">
            <div className="h-[400px] bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl" />
            <div className="h-[400px] bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl" />
        </div>
    </div>
  );
}

function EmptyAgencyProfile() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 bg-[#1e1e2c] border border-[#2a2a3c] p-16 rounded-[48px] ring-1 ring-white/5 shadow-2xl"
        >
            <div className="w-24 h-24 bg-[#26263a] rounded-[32px] flex items-center justify-center mx-auto text-[#f97316] relative">
                <div className="absolute inset-0 bg-[#f97316]/20 blur-2xl rounded-full" />
                <Building2 size={48} className="relative z-10" />
            </div>
            <div className="space-y-4">
                <h2 className="text-3xl font-bold text-[#f0f0f5]">Signature Not Detected</h2>
                <p className="text-[#9ca3b4] max-w-md mx-auto leading-relaxed">
                    Your agency profile has not been initialized. Establish your operational baseline via the onboarding protocol.
                </p>
            </div>
            <Button asChild className="h-14 px-8 bg-[#f97316] text-[#1a1a26] hover:bg-[#fb923c] rounded-2xl font-bold text-[16px] shadow-xl shadow-[#f97316]/10">
                <Link href="/dashboard/onboarding">Initiate Onboarding</Link>
            </Button>
        </motion.div>
    </div>
  );
}
