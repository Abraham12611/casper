"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";
import { 
  Buildings, 
  Crosshair, 
  ShieldCheck, 
  CheckCircle, 
  ArrowSquareOut,
  FileText,
  Clock,
  Palette,
  PencilSimple,
  FloppyDisk,
  X,
  Plus,
  Trash,
  Warning,
  SpinnerGap,
  GearSix,
  Briefcase,
  MagnifyingGlass,
  Lightning,
  Fingerprint,
  Cpu,
  Database,
  Terminal,
  ArrowUpRight,
  MapPin
} from "@phosphor-icons/react";
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
      toast.success("Agency Profile Updated.");
    } catch (err: any) {
      const errorMsg = err.message || "Failed to save changes.";
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
    toast.success("Claim Added");
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
    toast.success("Guardrail Added");
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
      toast.success("Availability Slot Added");
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
                <h1 className="text-[32px] font-bold text-[#1A1A1A] tracking-tight">
                    Agency Profile
                </h1>
                <p className="text-[#6B6B6B] text-[15px]">
                    Configuration for <span className="text-[#1A1A1A] font-medium">{agencyProfile.companyName}</span>.
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white border border-[#E8E8E8] rounded-xl flex items-center gap-3 h-12">
                    <div className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                    <span className="text-[12px] font-semibold text-[#1A1A1A]">Synced</span>
                </div>
            </div>
        </motion.div>

        {error && (
            <Alert variant="destructive" className="bg-[#FDECEA] border-[#F5C6CB] rounded-xl mb-6">
                <Warning className="h-4 w-4" />
                <AlertDescription className="text-[13px]">{error}</AlertDescription>
            </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="p-1 bg-white border border-[#E8E8E8] rounded-xl w-full max-w-2xl h-14">
                <TabsTrigger value="overview" className="flex-1 h-12 rounded-xl text-[13px] font-semibold cursor-pointer data-[state=active]:bg-[#F5F5F5] data-[state=active]:text-[#1A1A1A] text-[#9A9A9A] gap-2 transition-all">
                    Overview
                </TabsTrigger>
                <TabsTrigger value="content" className="flex-1 h-12 rounded-xl text-[13px] font-semibold cursor-pointer data-[state=active]:bg-[#F5F5F5] data-[state=active]:text-[#1A1A1A] text-[#9A9A9A] gap-2 transition-all">
                    Guardrails
                </TabsTrigger>
                <TabsTrigger value="targeting" className="flex-1 h-12 rounded-xl text-[13px] font-semibold cursor-pointer data-[state=active]:bg-[#F5F5F5] data-[state=active]:text-[#1A1A1A] text-[#9A9A9A] gap-2 transition-all">
                    Targeting
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 h-12 rounded-xl text-[13px] font-semibold cursor-pointer data-[state=active]:bg-[#F5F5F5] data-[state=active]:text-[#1A1A1A] text-[#9A9A9A] gap-2 transition-all">
                    Settings
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
                            className="bg-white border border-[#E8E8E8] rounded-xl p-8 space-y-6 "
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-[#1A1A1A]" />
                                    <h3 className="text-[18px] font-bold text-[#1A1A1A]">Agency Summary</h3>
                                </div>
                                {editingSection !== 'summary' ? (
                                    <Button onClick={() => handleStartEdit('summary')} variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#F5F5F5] text-[#9A9A9A] hover:text-[#1A1A1A]">
                                        <PencilSimple size={16} />
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="h-9 w-9 p-0 text-[#C62828] hover:bg-[#C62828]/10"><X size={16} /></Button>
                                        <Button onClick={handleSave} variant="ghost" size="sm" className="h-9 w-9 p-0 text-[#2E7D32] hover:bg-[#2E7D32]/10" disabled={isSaving}>
                                            {isSaving ? <SpinnerGap size={16} className="animate-spin" /> : <FloppyDisk size={16} />}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            {editingSection === 'summary' ? (
                                <Textarea 
                                    value={editSummary} 
                                    onChange={(e) => setEditSummary(e.target.value)} 
                                    rows={8} 
                                    className="w-full bg-[#F5F5F5] border-[#E2E2E2] rounded-2xl p-4 text-[14px] text-[#1A1A1A] focus:border-[#1A1A1A] transition-all outline-none" 
                                />
                            ) : (
                                <p className="text-[14px] leading-relaxed text-[#6B6B6B] whitespace-pre-wrap">
                                    {agencyProfile.summary || "No summary provided yet."}
                                </p>
                            )}
                        </motion.div>

                        {/* Core Offer */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-[#E8E8E8] rounded-xl p-8 space-y-6 "
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Crosshair size={18} className="text-[#1A1A1A]" />
                                    <h3 className="text-[18px] font-bold text-[#1A1A1A]">Core Offer</h3>
                                </div>
                                {editingSection !== 'offer' ? (
                                    <Button onClick={() => handleStartEdit('offer')} variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-[#F5F5F5] text-[#9A9A9A] hover:text-[#1A1A1A]">
                                        <PencilSimple size={16} />
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleCancelEdit} variant="ghost" size="sm" className="h-9 w-9 p-0 text-[#C62828] hover:bg-[#C62828]/10"><X size={16} /></Button>
                                        <Button onClick={handleSave} variant="ghost" size="sm" className="h-9 w-9 p-0 text-[#2E7D32] hover:bg-[#2E7D32]/10" disabled={isSaving}>
                                            {isSaving ? <SpinnerGap size={16} className="animate-spin" /> : <FloppyDisk size={16} />}
                                        </Button>
                                    </div>
                                )}
                            </div>
                            
                            {editingSection === 'offer' ? (
                                <Textarea 
                                    value={editCoreOffer} 
                                    onChange={(e) => setEditCoreOffer(e.target.value)} 
                                    rows={8} 
                                    className="w-full bg-[#F5F5F5] border-[#E2E2E2] rounded-2xl p-4 text-[14px] text-[#1A1A1A] focus:border-[#1A1A1A] transition-all outline-none" 
                                />
                            ) : (
                                <p className="text-[14px] leading-relaxed text-[#6B6B6B] whitespace-pre-wrap">
                                    {agencyProfile.coreOffer || "No core offer defined yet."}
                                </p>
                            )}
                        </motion.div>
                    </div>
                </TabsContent>

                {/* Security/Protocol Tab */}
                <TabsContent value="content" className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        {/* Guardrails */}
                        <div className="bg-white border border-[#E8E8E8] rounded-xl p-8 space-y-6 ">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={18} className="text-[#333333]" />
                                    <h3 className="text-[18px] font-bold text-[#1A1A1A]">Guardrails</h3>
                                </div>
                                {editingSection !== 'guardrails' ? (
                                    <Button onClick={() => handleStartEdit('guardrails')} variant="ghost" size="sm" className="h-9 rounded-xl border border-[#E2E2E2] px-4 text-[12px] font-bold  hover:text-[#1A1A1A]">
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} variant="ghost" className="h-9 rounded-xl px-4 text-[#2E7D32] hover:bg-[#2E7D32]/10 uppercase text-[12px] font-bold tracking-widest" disabled={isSaving}>
                                            Save Changes
                                        </Button>
                                        <Button onClick={handleCancelEdit} variant="ghost" className="h-9 rounded-xl px-4 text-[#C62828] hover:bg-[#C62828]/10 uppercase text-[12px] font-bold tracking-widest">Cancel</Button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(editingSection === 'guardrails' ? editGuardrails : (agencyProfile.guardrails || [])).map((g, i) => (
                                    <motion.div 
                                        key={i}
                                        className="p-4 bg-[#F5F5F5] border border-[#E2E2E2] rounded-2xl flex items-center justify-between group transition-all hover:border-[#CCCCCC]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#333333]">
                                                <ShieldCheck size={14} />
                                            </div>
                                            <span className="text-[13px] text-[#1A1A1A] font-medium leading-relaxed">{g}</span>
                                        </div>
                                        {editingSection === 'guardrails' && (
                                            <Button 
                                                onClick={() => handleRemoveGuardrail(g)} 
                                                variant="ghost" 
                                                className="h-8 w-8 p-0 text-[#9A9A9A] hover:text-[#C62828] hover:bg-[#C62828]/10 rounded-lg"
                                            >
                                                <Trash size={14} />
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
                                            className="h-12 bg-[#F5F5F5] border-[#E2E2E2] rounded-xl text-[13px] focus:ring-1 focus:ring-[#333333]/40 outline-none flex-1"
                                        />
                                        <Button onClick={handleAddGuardrail} variant="outline" className="h-12 px-6 rounded-xl border-[#E2E2E2] bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#F5F5F5]">
                                            <Plus size={16} className="mr-2" />
                                            Add Guardrail
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Claims */}
                        <div className="bg-white border border-[#E8E8E8] rounded-xl p-8 space-y-6 ">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={18} className="text-[#2E7D32]" />
                                    <h3 className="text-[18px] font-bold text-[#1A1A1A]">Verified Claims</h3>
                                </div>
                                {editingSection !== 'claims' ? (
                                    <Button onClick={() => handleStartEdit('claims')} variant="ghost" size="sm" className="h-9 rounded-xl border border-[#E2E2E2] px-4 text-[12px] font-bold  hover:text-[#2E7D32]">
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} variant="ghost" className="h-9 rounded-xl px-4 text-[#2E7D32] hover:bg-[#2E7D32]/10 uppercase text-[12px] font-bold tracking-widest" disabled={isSaving}>
                                            Save Changes
                                        </Button>
                                        <Button onClick={handleCancelEdit} variant="ghost" className="h-9 rounded-xl px-4 text-[#C62828] hover:bg-[#C62828]/10 uppercase text-[12px] font-bold tracking-widest">Cancel</Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {(editingSection === 'claims' ? editClaims : (agencyProfile.approvedClaims || [])).map((claim: any, i: number) => (
                                    <div key={claim.id || i} className="p-5 bg-[#F5F5F5] border border-[#E2E2E2] rounded-2xl space-y-3 group hover:border-[#2E7D32]/40 transition-all">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/20 text-[10px] uppercase tracking-widest">ID #{String(i + 1).padStart(2, '0')}</Badge>
                                                {claim.source_url && (
                                                    <a href={claim.source_url} target="_blank" className="text-[10px] text-[#9A9A9A] hover:text-[#1A1A1A] flex items-center gap-1 ">
                                                        <ArrowSquareOut size={10} /> Source Link
                                                    </a>
                                                )}
                                            </div>
                                            {editingSection === 'claims' && (
                                                <Button onClick={() => handleRemoveClaim(i)} variant="ghost" className="h-8 w-8 p-0 text-[#9A9A9A] hover:text-[#C62828] hover:bg-[#C62828]/10 rounded-lg">
                                                    <Trash size={14} />
                                                </Button>
                                            )}
                                        </div>
                                        {editingSection === 'claims' ? (
                                            <div className="space-y-3">
                                                <Textarea 
                                                    value={claim.text} 
                                                    onChange={(e) => handleEditClaim(i, "text", e.target.value)}
                                                    className="w-full bg-white border-[#E2E2E2] rounded-xl p-3 text-[13px] text-[#1A1A1A] outline-none"
                                                    rows={2}
                                                />
                                                <Input 
                                                    value={claim.source_url || ""} 
                                                    onChange={(e) => handleEditClaim(i, "source_url", e.target.value)}
                                                    placeholder="Source URL (optional)"
                                                    className="h-10 bg-white border-[#E2E2E2] rounded-xl text-[12px]"
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-[14px] leading-relaxed text-[#1A1A1A]">{claim.text}</p>
                                        )}
                                    </div>
                                ))}
                                {editingSection === 'claims' && (
                                    <div className="p-6 bg-[#F5F5F5] border border-dashed border-[#2E7D32]/30 rounded-xl space-y-4">
                                        <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-2 flex items-center gap-2"><Plus size={16} /> Add New Claim</h4>
                                        <Textarea 
                                            value={newClaimText} 
                                            onChange={(e) => setNewClaimText(e.target.value)}
                                            placeholder="Enter business claim text..."
                                            className="w-full bg-[#F5F5F5] border-[#E2E2E2] rounded-xl p-4 text-[13px] outline-none"
                                            rows={3}
                                        />
                                        <div className="flex gap-4">
                                            <Input 
                                                value={newClaimSourceUrl} 
                                                onChange={(e) => setNewClaimSourceUrl(e.target.value)}
                                                placeholder="Verification URL (optional)"
                                                className="h-11 bg-[#F5F5F5] border-[#E2E2E2] rounded-xl text-[13px] flex-1"
                                            />
                                            <Button onClick={handleAddClaim} disabled={!newClaimText.trim()} className="h-11 px-6 bg-[#2E7D32] text-[#0d0d13] hover:bg-[#2E7D32]/90 rounded-xl font-bold">
                                                Add Claim
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
                        className="bg-white border border-[#E8E8E8] rounded-xl p-8 space-y-8 "
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Crosshair size={18} className="text-[#1A1A1A]" />
                                <h3 className="text-[18px] font-bold text-[#1A1A1A]">Target Settings</h3>
                            </div>
                            {editingSection !== 'targeting' ? (
                                <Button onClick={() => handleStartEdit('targeting')} variant="ghost" size="sm" className="h-9 rounded-xl border border-[#E2E2E2] px-4 text-[12px] font-bold  hover:text-[#1A1A1A]">
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} variant="ghost" className="h-9 rounded-xl px-4 text-[#2E7D32] hover:bg-[#2E7D32]/10 uppercase text-[12px] font-bold tracking-widest" disabled={isSaving}>
                                        Save Changes
                                    </Button>
                                    <Button onClick={handleCancelEdit} variant="ghost" className="h-9 rounded-xl px-4 text-[#C62828] hover:bg-[#C62828]/10 uppercase text-[12px] font-bold tracking-widest">Cancel</Button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-bold text-[#6B6B6B]  block mb-4">Industry Vertical</label>
                                    {editingSection === 'targeting' ? (
                                        <Select value={editTargetVertical} onValueChange={setEditTargetVertical}>
                                            <SelectTrigger className="h-12 bg-[#F5F5F5] border-[#E2E2E2] rounded-xl text-[#1A1A1A]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-[#E8E8E8] text-[#1A1A1A]">
                                                {TARGET_VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="p-4 bg-[#F5F5F5] border border-[#E2E2E2] rounded-2xl flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#1A1A1A]">{agencyProfile.targetVertical || "General"}</span>
                                            <ArrowUpRight size={14} className="text-[#1A1A1A]" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-[#6B6B6B]  block mb-4">Target Geography</label>
                                    {editingSection === 'targeting' ? (
                                        <Input 
                                            value={editTargetGeography} 
                                            onChange={(e) => setEditTargetGeography(e.target.value)}
                                            placeholder="e.g. Dallas, TX" 
                                            className="h-12 bg-[#F5F5F5] border-[#E2E2E2] rounded-xl"
                                        />
                                    ) : (
                                        <div className="p-4 bg-[#F5F5F5] border border-[#E2E2E2] rounded-2xl flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#1A1A1A]">{agencyProfile.targetGeography || "Not specified"}</span>
                                            <MapPin size={14} className="text-[#1A1A1A]" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-[#6B6B6B]  block mb-4">Lead Qualification Criteria</label>
                                <div className="space-y-3">
                                    {LEAD_QUALIFICATION_OPTIONS.map(opt => (
                                        <label 
                                            key={opt.value} 
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                                (editingSection === 'targeting' ? editLeadQualificationCriteria.includes(opt.value) : agencyProfile.leadQualificationCriteria?.includes(opt.value))
                                                    ? "bg-[#F5F5F5] border-[#CCCCCC] text-[#1A1A1A]" 
                                                    : "bg-[#F5F5F5] border-[#E2E2E2] text-[#6B6B6B] opacity-60"
                                            )}
                                        >
                                            <Checkbox 
                                                checked={editingSection === 'targeting' ? editLeadQualificationCriteria.includes(opt.value) : agencyProfile.leadQualificationCriteria?.includes(opt.value)} 
                                                onCheckedChange={() => editingSection === 'targeting' && handleQualificationCriteriaToggle(opt.value)}
                                                disabled={editingSection !== 'targeting'}
                                                className="border-[#E8E8E8] data-[state=checked]:bg-[#1A1A1A]"
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
                        className="bg-white border border-[#E8E8E8] rounded-xl p-8 space-y-8 "
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Palette size={18} className="text-[#1A1A1A]" />
                                <h3 className="text-[18px] font-bold text-[#1A1A1A]">Communication Settings</h3>
                            </div>
                            {editingSection !== 'settings' ? (
                                <Button onClick={() => handleStartEdit('settings')} variant="ghost" size="sm" className="h-9 rounded-xl border border-[#E2E2E2] px-4 text-[12px] font-bold  hover:text-[#1A1A1A]">
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button onClick={handleSave} variant="ghost" className="h-9 rounded-xl px-4 text-[#2E7D32] hover:bg-[#2E7D32]/10 uppercase text-[12px] font-bold tracking-widest" disabled={isSaving}>
                                        Save Changes
                                    </Button>
                                    <Button onClick={handleCancelEdit} variant="ghost" className="h-9 rounded-xl px-4 text-[#C62828] hover:bg-[#C62828]/10 uppercase text-[12px] font-bold tracking-widest">Cancel</Button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-bold text-[#6B6B6B]  block mb-4">Call Tone</label>
                                    {editingSection === 'settings' ? (
                                        <Select value={editTone} onValueChange={setEditTone}>
                                            <SelectTrigger className="h-12 bg-[#F5F5F5] border-[#E2E2E2] rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>{TONE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="p-4 bg-[#F5F5F5] border border-[#E2E2E2] rounded-2xl flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#1A1A1A] capitalize">{agencyProfile.tone || "Professional"}</span>
                                            <Lightning size={14} className="text-[#1A1A1A]" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-bold text-[#6B6B6B]  block mb-4">Time Zone</label>
                                    {editingSection === 'settings' ? (
                                        <Select value={editTimeZone} onValueChange={setEditTimeZone}>
                                            <SelectTrigger className="h-12 bg-[#F5F5F5] border-[#E2E2E2] rounded-xl"><SelectValue /></SelectTrigger>
                                            <SelectContent>{NA_TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="p-4 bg-[#F5F5F5] border border-[#E2E2E2] rounded-2xl flex items-center justify-between">
                                            <span className="text-[14px] font-bold text-[#1A1A1A]">{agencyProfile.timeZone || "UTC-8"}</span>
                                            <Clock size={14} className="text-[#1A1A1A]" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-[11px] font-bold text-[#6B6B6B]  block mb-4">Availability Slots</label>
                                <div className="grid grid-cols-1 gap-6">
                                    {editingSection === 'settings' && (
                                        <div className="p-6 bg-[#F5F5F5] border border-dashed border-[#E2E2E2] rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-[#9A9A9A] font-bold uppercase">Day</label>
                                                <Select value={availabilityDay} onValueChange={setAvailabilityDay}>
                                                    <SelectTrigger className="h-10 bg-white border-[#E2E2E2] rounded-xl"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-[#9A9A9A] font-bold uppercase">Start Time</label>
                                                <Input type="time" value={availabilityStart} onChange={(e) => setAvailabilityStart(e.target.value)} className="h-10 bg-white border-[#E2E2E2] rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-[#9A9A9A] font-bold uppercase">End Time</label>
                                                <Input type="time" value={availabilityEnd} onChange={(e) => setAvailabilityEnd(e.target.value)} className="h-10 bg-white border-[#E2E2E2] rounded-xl" />
                                            </div>
                                            <Button onClick={handleAddAvailabilitySlot} variant="outline" className="h-10 rounded-xl border-[#E2E2E2] bg-white text-[#1A1A1A] font-bold">Add Slot</Button>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {(editingSection === 'settings' ? editAvailability : (agencyProfile.availability || [])).map((slot, i) => (
                                            <div key={i} className="px-4 py-2 bg-[#F5F5F5] border border-[#E2E2E2] rounded-xl flex items-center gap-3 transition-all hover:border-[#CCCCCC]">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] " />
                                                <span className="text-[13px] text-[#1A1A1A] font-medium">{slot}</span>
                                                {editingSection === 'settings' && (
                                                    <Button onClick={() => handleRemoveAvailabilitySlot(slot)} variant="ghost" className="h-6 w-6 p-0 text-[#C62828] hover:bg-[#C62828]/10 rounded">
                                                        <Trash size={12} />
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
        <div className="h-24 w-1/3 bg-white border border-[#E8E8E8] rounded-xl" />
        <div className="h-14 w-full max-w-2xl bg-white border border-[#E8E8E8] rounded-2xl" />
        <div className="grid grid-cols-2 gap-8">
            <div className="h-[400px] bg-white border border-[#E8E8E8] rounded-xl" />
            <div className="h-[400px] bg-white border border-[#E8E8E8] rounded-xl" />
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
            className="text-center space-y-8 bg-white border border-[#E8E8E8] p-16 rounded-xl  shadow-lg"
        >
            <div className="w-24 h-24 bg-[#F5F5F5] rounded-xl flex items-center justify-center mx-auto text-[#1A1A1A] relative">
                <div className="absolute inset-0 bg-[#F0F0F0]  rounded-full" />
                <Buildings size={48} className="relative z-10" />
            </div>
            <div className="space-y-4">
                <h2 className="text-3xl font-bold text-[#1A1A1A]">No Profile Found</h2>
                <p className="text-[#6B6B6B] max-w-md mx-auto leading-relaxed">
                    Your agency profile has not been initialized. Establish your profile through the onboarding process.
                </p>
            </div>
            <Button asChild className="h-14 px-8 bg-[#1A1A1A] text-white hover:bg-[#000000] rounded-xl font-semibold text-[16px]">
                <Link href="/dashboard/onboarding">Start Onboarding</Link>
            </Button>
        </motion.div>
    </div>
  );
}
