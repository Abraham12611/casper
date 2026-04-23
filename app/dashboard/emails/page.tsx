"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EnvelopeSimple,
  PaperPlaneTilt,
  WarningCircle,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  CalendarBlank,
  MagnifyingGlass,
  Funnel,
  FileSearch,
  ClockCounterClockwise,
  Terminal,
  ChartLineUp,
  Lightning,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  WifiHigh,
  ArrowSquareOut,
  CaretRight,
  SpinnerGap
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CasperStatCard } from "@/components/ui/CasperStatCard";

type EmailListItem = {
  _id: Id<"emails">;
  _creationTime: number;
  opportunityId: Id<"client_opportunities">;
  agencyId?: Id<"agency_profile">;
  from: string;
  to: string;
  subject: string;
  type: "prospect_confirmation" | "agency_summary";
  status: "queued" | "sent" | "failed";
  error?: string;
  sent_at?: number;
  icsUrl: string | null;
  prospectName?: string;
  prospectPhone?: string;
  prospectEmail?: string;
  prospectAddress?: string;
  targetVertical?: string;
  targetGeography?: string;
  leadGenFlowId?: Id<"lead_gen_flow">;
};

export default function EmailsPage() {
  const agencyProfile = useQuery(api.sellerBrain.getForCurrentUser);
  const emails = useQuery(
    api.call.emails.listByAgency,
    agencyProfile?.agencyProfileId ? { agencyId: agencyProfile.agencyProfileId } : "skip"
  ) as EmailListItem[] | undefined;

  const [selectedEmailId, setSelectedEmailId] = useState<Id<"emails"> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const selectedEmail = useQuery(
    api.call.emails.getEmailById,
    selectedEmailId ? { emailId: selectedEmailId } : "skip"
  );

  const [typeFilter, setTypeFilter] = useState<"all" | "prospect_confirmation" | "agency_summary">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "queued" | "sent" | "failed">("all");
  const [queryStr, setQueryStr] = useState("");
  const [copied, setCopied] = useState<"" | "subject" | "html">("");

  const filtered = useMemo(() => {
    if (!emails) return [] as EmailListItem[];
    const q = queryStr.trim().toLowerCase();
    return emails.filter((e) => {
      const typeOk = typeFilter === "all" || e.type === typeFilter;
      const statusOk = statusFilter === "all" || e.status === statusFilter;
      const text = `${e.subject} ${e.to} ${e.from} ${e.prospectName ?? ""} ${e.prospectEmail ?? ""}`.toLowerCase();
      const qOk = q.length === 0 || text.includes(q);
      return typeOk && statusOk && qOk;
    });
  }, [emails, typeFilter, statusFilter, queryStr]);

  const counts = useMemo(() => {
    if (!emails) return { total: 0, queued: 0, sent: 0, failed: 0 };
    return {
      total: emails.length,
      queued: emails.filter((e) => e.status === "queued").length,
      sent: emails.filter((e) => e.status === "sent").length,
      failed: emails.filter((e) => e.status === "failed").length,
    };
  }, [emails]);

  const handleEmailClick = (emailId: Id<"emails">) => {
    setSelectedEmailId(emailId);
    setDialogOpen(true);
  };

  const handleCopy = async (text: string, type: "subject" | "html") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 1200);
  };

  if (agencyProfile === undefined || emails === undefined) {
    return <EmailsPageSkeleton />;
  }

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
                    Message Activity
                </h1>
                <p className="text-[#6B6B6B] text-[15px]">
                    Confirmation messages and strategy updates sent to your prospects.
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white border border-[#E8E8E8] rounded-xl flex items-center gap-3 h-12">
                    <div className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                    <span className="text-[12px] font-semibold text-[#1A1A1A]">System Online</span>
                </div>
            </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CasperStatCard 
                title="Total Messages" 
                value={counts.total} 
                subtitle="All sent communications"
                accentColor="#9A9A9A"
                delay={1}
            />
            <CasperStatCard 
                title="Outgoing" 
                value={counts.queued} 
                subtitle="Messages pending"
                accentColor="#9A9A9A"
                delay={2}
            />
            <CasperStatCard 
                title="Delivered" 
                value={counts.sent} 
                subtitle="Successfully sent"
                accentColor="#9A9A9A"
                delay={3}
            />
            <CasperStatCard 
                title="Failed" 
                value={counts.failed} 
                subtitle="Delivery errors"
                accentColor="#9A9A9A"
                delay={4}
            />
        </div>

        {/* Filter Suite */}
        <div className="bg-white border border-[#E8E8E8] rounded-xl p-6">
            <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9A9A]" size={16} />
                    <input 
                        value={queryStr}
                        onChange={(e) => setQueryStr(e.target.value)}
                        placeholder="Search subject, IDs, or recipients..."
                        className="h-12 w-full bg-[#F5F5F5] border border-[#E2E2E2] rounded-xl pl-12 text-[14px] text-[#1A1A1A] placeholder:text-[#ADADAD] outline-none focus:border-[#1A1A1A] transition-all"
                    />
                </div>
                <div className="flex gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                        <SelectTrigger className="w-[180px] h-12 bg-[#F5F5F5] border-[#E2E2E2] rounded-xl text-[13px] font-medium text-[#1A1A1A]">
                            <SelectValue placeholder="Message Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#E8E8E8] text-[#1A1A1A]">
                            <SelectItem value="all">All Messages</SelectItem>
                            <SelectItem value="prospect_confirmation">Prospect Confirmation</SelectItem>
                            <SelectItem value="agency_summary">Summary</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                        <SelectTrigger className="w-[150px] h-12 bg-[#F5F5F5] border-[#E2E2E2] rounded-xl text-[13px] font-medium text-[#1A1A1A]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#E8E8E8] text-[#1A1A1A]">
                            <SelectItem value="all">Any Status</SelectItem>
                            <SelectItem value="queued">Queued</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-[14px] font-semibold text-[#6B6B6B]">Activity Feed</h2>
                <span className="text-[12px] text-[#9A9A9A]">{filtered.length} messages</span>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="wait">
                    {filtered.length > 0 ? (
                        filtered.map((email, idx) => (
                            <EmailTransmissionRow 
                                key={email._id} 
                                email={email} 
                                delay={idx * 0.03}
                                onClick={() => handleEmailClick(email._id)}
                            />
                        ))
                    ) : (
                        <div className="h-[200px] flex items-center justify-center border border-dashed border-[#E8E8E8] rounded-xl">
                            <div className="text-center">
                                <EnvelopeSimple size={24} className="mx-auto mb-2 text-[#9A9A9A]" />
                                <p className="text-[13px] text-[#9A9A9A]">No matching messages found</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Email Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-3xl bg-white border-[#E8E8E8] shadow-xl p-0 overflow-hidden rounded-xl">
                {selectedEmail ? (
                    <EmailDecryptionCenter 
                        email={selectedEmail as any} 
                        copied={copied} 
                        onCopy={handleCopy} 
                    />
                ) : (
                    <div className="h-[400px] flex items-center justify-center">
                        <SpinnerGap size={24} className="animate-spin text-[#1A1A1A]" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

function EmailTransmissionRow({ email, delay, onClick }: { email: EmailListItem, delay: number, onClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            onClick={onClick}
            className="group relative bg-white border border-[#E8E8E8] rounded-xl p-5 hover:border-[#CCCCCC] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all"
        >
            <div className="flex items-center gap-6 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[#F5F5F5] border border-[#EFEFEF] flex items-center justify-center text-[#9A9A9A] group-hover:bg-[#1A1A1A]/5 group-hover:text-[#1A1A1A] transition-colors shrink-0">
                    {email.type === "prospect_confirmation" ? <Lightning size={20} /> : <FileSearch size={20} />}
                </div>
                <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[15px] font-semibold text-[#1A1A1A] group-hover:text-[#000000] transition-colors truncate">{email.subject}</h3>
                        <span className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                            email.type === "prospect_confirmation" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-[#F3F0FF] text-[#5E35B1]"
                        )}>
                            {email.type === "prospect_confirmation" ? "Prospect" : "Agency"}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-[#9A9A9A]">
                        <span className="truncate max-w-[200px]">{email.to}</span>
                        <span className="w-1 h-1 rounded-full bg-[#E8E8E8]" />
                        <span>{new Date(email._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="w-1 h-1 rounded-full bg-[#E8E8E8]" />
                        <span>#{email._id.slice(-8)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <span className={cn(
                    "text-[11px] font-semibold px-2.5 py-1 rounded-full",
                    email.status === "sent" ? "text-[#2E7D32] bg-[#E8F5E9]" : 
                    email.status === "failed" ? "text-[#C62828] bg-[#FDECEA]" : "text-[#E65100] bg-[#FFF3E0]"
                )}>
                    {email.status}
                </span>
                <div className="w-8 h-8 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#9A9A9A] group-hover:text-[#1A1A1A] group-hover:border-[#CCCCCC] transition-all">
                    <CaretRight size={16} />
                </div>
            </div>
        </motion.div>
    );
}

function EmailDecryptionCenter({
  email,
  copied,
  onCopy,
}: {
  email: EmailListItem & { html: string };
  copied: "" | "subject" | "html";
  onCopy: (text: string, type: "subject" | "html") => void;
}) {
  return (
    <div className="flex flex-col h-[85vh]">
        {/* Modal Header */}
        <div className="p-8 border-b border-[#EBEBEB] bg-white">
            <div className="flex items-start justify-between gap-6 mb-6">
                <div className="space-y-1">
                    <span className="text-[12px] font-semibold text-[#6B6B6B]">Message Details</span>
                    <h2 className="text-[24px] font-bold text-[#1A1A1A]">{email.subject}</h2>
                </div>
                <div className="flex gap-2">
                    <span className={cn(
                        "text-[11px] font-semibold px-2.5 py-1 rounded-full",
                        email.status === "sent" ? "text-[#2E7D32] bg-[#E8F5E9]" : "text-[#E65100] bg-[#FFF3E0]"
                    )}>
                        {email.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F5F5F5] border border-[#EFEFEF] rounded-xl space-y-1">
                    <p className="text-[11px] font-semibold text-[#9A9A9A]">From</p>
                    <p className="text-[13px] text-[#1A1A1A] truncate">{email.from}</p>
                </div>
                <div className="p-4 bg-[#F5F5F5] border border-[#EFEFEF] rounded-xl space-y-1">
                    <p className="text-[11px] font-semibold text-[#9A9A9A]">Recipient</p>
                    <p className="text-[13px] text-[#1A1A1A] truncate">{email.to}</p>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F5F5F5]">
            {email.error && (
                <div className="p-4 bg-[#FDECEA] border border-[#F5C6CB] rounded-xl flex items-start gap-4">
                    <WarningCircle size={20} className="text-[#C62828] shrink-0 mt-1" />
                    <div className="space-y-1">
                        <p className="text-[12px] font-semibold text-[#C62828]">Delivery Error</p>
                        <p className="text-[13px] text-[#C62828]/80 leading-relaxed">{email.error}</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#6B6B6B]">Email Content</span>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onCopy(email.html, "html")}
                        className="h-8 px-4 border border-[#E2E2E2] rounded-lg text-[12px] font-medium text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#1A1A1A]"
                    >
                        {copied === "html" ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                        {copied === "html" ? "Copied" : "Copy Content"}
                    </Button>
                </div>

                <div className="p-6 bg-white border border-[#E8E8E8] rounded-xl">
                    <div
                        className="prose prose-sm max-w-none prose-headings:text-[#1A1A1A] prose-p:text-[#6B6B6B] prose-strong:text-[#1A1A1A]"
                        dangerouslySetInnerHTML={{ __html: email.html }}
                    />
                </div>
            </div>

            {email.icsUrl && (
                <div className="p-6 bg-[#E3F2FD] border border-[#BBDEFB] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1565C0]/10 flex items-center justify-center text-[#1565C0]">
                            <CalendarBlank size={20} />
                        </div>
                        <div>
                            <p className="text-[14px] font-semibold text-[#1A1A1A]">Calendar Invitation</p>
                            <p className="text-[12px] text-[#6B6B6B]">Calendar invitation link (.ics) generated</p>
                        </div>
                    </div>
                    <Button asChild className="bg-[#1A1A1A] text-white hover:bg-[#000000] rounded-xl px-6 h-11 font-semibold">
                        <a href={email.icsUrl} target="_blank" rel="noopener noreferrer">
                            <ArrowSquareOut size={16} className="mr-2" />
                            Open
                        </a>
                    </Button>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#EBEBEB] bg-white flex items-center justify-between text-[12px] text-[#9A9A9A]">
            <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#2E7D32]" />
                <span className="font-medium">Delivery verified</span>
            </div>
            <span>ID: {email._id}</span>
        </div>
    </div>
  );
}

function EmailsPageSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12 animate-pulse">
        <div className="h-24 w-1/3 bg-[#E8E8E8] rounded-xl" />
        <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white border border-[#E8E8E8] rounded-xl" />)}
        </div>
        <div className="h-20 w-full bg-white border border-[#E8E8E8] rounded-xl" />
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-white border border-[#E8E8E8] rounded-xl" />)}
        </div>
    </div>
  );
}
