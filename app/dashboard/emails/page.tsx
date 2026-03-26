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
  Mail,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Calendar,
  Search,
  Filter,
  FileQuestion,
  History,
  Terminal,
  Activity,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Wifi,
  ExternalLink
} from "lucide-react";
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
                <div className="flex items-center gap-3 mb-1">
                    <Activity size={20} className="text-[#3b82f6]" />
                    <span className="text-[12px] font-mono font-bold text-[#3b82f6] uppercase tracking-[0.2em]">Communication History</span>
                </div>
                <h1 className="text-[32px] font-bold text-[#f0f0f5] tracking-tight">
                    Message Activity
                </h1>
                <p className="text-[#9ca3b4] text-[15px]">
                    Confirmation messages and strategy updates sent to your prospects.
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-[#1e1e2c] border border-[#2a2a3c] rounded-xl flex items-center gap-3 h-12 shadow-sm">
                    <Wifi size={14} className="text-[#22c55e]" />
                    <span className="text-[12px] font-mono font-bold text-[#f0f0f5] uppercase tracking-wider">SYSTEM ONLINE</span>
                </div>
            </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CasperStatCard 
                title="Total Messages" 
                value={counts.total} 
                subtitle="All sent communications"
                accentColor="#3b82f6"
                delay={1}
            />
            <CasperStatCard 
                title="Outgoing" 
                value={counts.queued} 
                subtitle="Messages pending"
                accentColor="#f59e0b"
                delay={2}
            />
            <CasperStatCard 
                title="Delivered" 
                value={counts.sent} 
                subtitle="Successfully sent"
                accentColor="#22c55e"
                delay={3}
            />
            <CasperStatCard 
                title="Failed" 
                value={counts.failed} 
                subtitle="Delivery errors"
                accentColor="#ef4444"
                delay={4}
            />
        </div>

        {/* Filter Suite */}
        <div className="bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl p-6 ring-1 ring-white/5">
            <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525e]" size={16} />
                    <Input 
                        value={queryStr}
                        onChange={(e) => setQueryStr(e.target.value)}
                        placeholder="Search subject, IDs, or recipients..."
                        className="h-12 w-full bg-[#161621] border-[#2e2e40] rounded-xl pl-12 text-[14px] text-[#f0f0f5] placeholder:text-[#52525e] outline-none focus:ring-1 focus:ring-[#3b82f6]/40 transition-all border-none"
                    />
                </div>
                <div className="flex gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                        <SelectTrigger className="w-[180px] h-12 bg-[#161621] border-[#2e2e40] rounded-xl text-[12px] font-bold uppercase tracking-wider text-[#f0f0f5]">
                            <SelectValue placeholder="Message Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e2c] border-[#2a2a3c] text-[#f0f0f5]">
                            <SelectItem value="all">ALL MESSAGES</SelectItem>
                            <SelectItem value="prospect_confirmation">PROSPECT CONFIRMATION</SelectItem>
                            <SelectItem value="agency_summary">SUMMARY</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                        <SelectTrigger className="w-[150px] h-12 bg-[#161621] border-[#2e2e40] rounded-xl text-[12px] font-bold uppercase tracking-wider text-[#f0f0f5]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e1e2c] border-[#2a2a3c] text-[#f0f0f5]">
                            <SelectItem value="all">ANY STATUS</SelectItem>
                            <SelectItem value="queued">QUEUED</SelectItem>
                            <SelectItem value="sent">SENT</SelectItem>
                            <SelectItem value="failed">FAILED</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>

        {/* Transmission Stream */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-[12px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em]">Live Activity Feed</h2>
                <span className="text-[11px] font-mono text-[#52525e] uppercase tracking-wider">{filtered.length} MESSAGES LOGGED</span>
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
                        <div className="h-[200px] flex items-center justify-center border border-dashed border-[#2a2a3c] rounded-3xl opacity-30">
                            <div className="text-center">
                                <Terminal size={24} className="mx-auto mb-2 text-[#52525e]" />
                                <p className="text-[12px] font-mono uppercase tracking-widest">No matching messages found</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* Decryption Window (Dialog) */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-3xl bg-[#1e1e2c] border-[#2a2a3c] shadow-2xl p-0 overflow-hidden rounded-[32px]">
                {selectedEmail ? (
                    <EmailDecryptionCenter 
                        email={selectedEmail as any} 
                        copied={copied} 
                        onCopy={handleCopy} 
                    />
                ) : (
                    <div className="h-[400px] flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-[#3b82f6]" />
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
            className="group relative bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl p-5 hover:bg-[#22222e] hover:border-[#3b82f6]/40 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all ring-1 ring-white/5"
        >
            <div className="flex items-center gap-6 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-[#26263a] border border-[#2e2e40] flex items-center justify-center text-[#9ca3b4] group-hover:bg-[#3b82f6]/10 group-hover:text-[#3b82f6] transition-colors shrink-0">
                    {email.type === "prospect_confirmation" ? <Zap size={20} /> : <FileQuestion size={20} />}
                </div>
                <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-[16px] font-bold text-[#f0f0f5] group-hover:text-white transition-colors truncate">{email.subject}</h3>
                        <Badge variant="outline" className={cn(
                            "text-[10px] font-mono uppercase tracking-widest h-5 px-1.5",
                            email.type === "prospect_confirmation" ? "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20" : "bg-[#7b61ff]/10 text-[#7b61ff] border-[#7b61ff]/20"
                        )}>
                            {email.type === "prospect_confirmation" ? "Prospect" : "Agency"}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-[#52525e] font-mono uppercase tracking-wider">
                        <span className="truncate max-w-[200px]">{email.to}</span>
                        <span className="w-1 h-1 rounded-full bg-[#2a2a3c]" />
                        <span>SENT {new Date(email._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="w-1 h-1 rounded-full bg-[#2a2a3c]" />
                        <span>ID: {email._id.slice(-8)}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                <Badge variant="outline" className={cn(
                    "text-[11px] font-mono uppercase tracking-widest h-8 px-3 border-[#2a2a3c]",
                    email.status === "sent" ? "text-[#22c55e] bg-[#22c55e]/5" : 
                    email.status === "failed" ? "text-red-400 bg-red-400/5" : "text-amber-400 bg-amber-400/5"
                )}>
                    {email.status}
                </Badge>
                <div className="w-8 h-8 rounded-full border border-[#2a2a3c] flex items-center justify-center text-[#52525e] group-hover:text-[#f0f0f5] group-hover:border-[#f0f0f5]/20 group-hover:translate-x-1 transition-all">
                    <ChevronRight size={16} />
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
        <div className="p-8 border-b border-[#2a2a3c] bg-[#22222e]">
            <div className="flex items-start justify-between gap-6 mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-[#3b82f6]" />
                        <span className="text-[12px] font-mono font-bold text-[#3b82f6] uppercase tracking-[0.2em]">Message Details</span>
                    </div>
                    <h2 className="text-[24px] font-bold text-[#f0f0f5]">{email.subject}</h2>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className={cn(
                        "text-[11px] font-mono uppercase tracking-widest h-8 px-3 border-[#2a2a3c]",
                        email.status === "sent" ? "text-[#22c55e] bg-[#22c55e]/5" : "text-amber-400 bg-amber-400/5"
                    )}>
                        {email.status}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#161621] border border-[#2e2e40] rounded-2xl space-y-1 group hover:border-[#3b82f6]/30 transition-all">
                    <p className="text-[10px] font-bold text-[#52525e] uppercase tracking-widest">From</p>
                    <p className="text-[13px] text-[#f0f0f5] font-mono truncate">{email.from}</p>
                </div>
                <div className="p-4 bg-[#161621] border border-[#2e2e40] rounded-2xl space-y-1 group hover:border-[#3b82f6]/30 transition-all">
                    <p className="text-[10px] font-bold text-[#52525e] uppercase tracking-widest">Recipient</p>
                    <p className="text-[13px] text-[#f0f0f5] font-mono truncate">{email.to}</p>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#161621]">
            {email.error && (
                <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-2xl flex items-start gap-4">
                    <AlertCircle size={20} className="text-red-400 shrink-0 mt-1" />
                    <div className="space-y-1">
                        <p className="text-[12px] font-bold text-red-400 uppercase tracking-widest">Delivery Error</p>
                        <p className="text-[13px] text-red-400/80 leading-relaxed font-mono">{email.error}</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Cpu size={14} className="text-[#52525e]" />
                        <span className="text-[11px] font-bold text-[#52525e] uppercase tracking-widest">Email Content</span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onCopy(email.html, "html")}
                        className="h-8 px-4 border border-[#2e2e40] rounded-lg text-[11px] font-bold uppercase tracking-widest text-[#9ca3b4] hover:text-[#f0f0f5]"
                    >
                        {copied === "html" ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                        {copied === "html" ? "Copied" : "Copy Content"}
                    </Button>
                </div>

                <div className="p-6 bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px] shadow-inner">
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-[#f0f0f5] prose-p:text-[#9ca3b4] prose-strong:text-white"
                        dangerouslySetInnerHTML={{ __html: email.html }}
                    />
                </div>
            </div>

            {email.icsUrl && (
                <div className="p-6 bg-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-3xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-[14px] font-bold text-[#f0f0f5]">Calendar Invitation</p>
                            <p className="text-[12px] text-[#9ca3b4]">Calendar invitation link (.ics) generated</p>
                        </div>
                    </div>
                    <Button asChild className="bg-[#3b82f6] text-white hover:bg-[#2563eb] rounded-xl px-6 h-11 font-bold">
                        <a href={email.icsUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} className="mr-2" />
                            Synchronize
                        </a>
                    </Button>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2a2a3c] bg-[#1e1e2c] flex items-center justify-between text-[11px] font-mono text-[#52525e] uppercase tracking-widest">
            <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#22c55e]" />
                DELIVERY VERIFIED
            </div>
            <span>ID {email._id}</span>
        </div>
    </div>
  );
}

function EmailsPageSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12 animate-pulse">
        <div className="h-24 w-1/3 bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px]" />
        <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl" />)}
        </div>
        <div className="h-20 w-full bg-[#1e1e2c] border border-[#2a2a3c] rounded-3xl" />
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl" />)}
        </div>
    </div>
  );
}

function ChevronRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
