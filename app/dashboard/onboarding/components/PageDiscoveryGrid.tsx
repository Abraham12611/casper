"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, Globe, Database, Terminal, FileText, Zap, ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageDiscoveryGridProps {
  onboardingFlowId: Id<"onboarding_flow">;
}

interface CrawlPage {
  url: string;
  title?: string;
  status: "queued" | "fetching" | "scraped" | "failed";
  httpStatus?: number;
}

function StatusChip({ status }: { status: CrawlPage["status"] }) {
    const getStatusConfig = () => {
        switch (status) {
            case "queued":
                return { label: "QUEUED", icon: Terminal, color: "text-[#9A9A9A] border-[#E8E8E8] bg-[#1a1a26]" };
            case "fetching":
                return { label: "FETCHING", icon: Loader2, color: "text-[#1A1A1A] border-[#1A1A1A]/30 bg-[#1A1A1A]/5", animate: true };
            case "scraped":
                return { label: "SCRAPED", icon: CheckCircle2, color: "text-[#2E7D32] border-[#2E7D32]/30 bg-[#2E7D32]/5" };
            case "failed":
                return { label: "FAILED", icon: XCircle, color: "text-red-400 border-red-400/30 bg-red-400/5" };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-widest",
            config.color
        )}>
            <Icon size={10} className={cn(config.animate && "animate-spin")} />
            {config.label}
        </div>
    );
}

function PageCard({ page, idx }: { page: CrawlPage, idx: number }) {
  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: idx * 0.05 }}
        className="group relative bg-white/50 border border-[#E8E8E8] rounded-2xl p-4 hover:bg-[#F5F5F5] hover:border-[#1A1A1A]/40 transition-all  overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[#1A1A1A] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-3">
        <StatusChip status={page.status} />
        {page.httpStatus && (
            <span className={cn(
                "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border",
                page.httpStatus < 300 ? "text-[#2E7D32] border-[#2E7D32]/20" : "text-red-400 border-red-400/20"
            )}>
                HTTP_{page.httpStatus}
            </span>
        )}
      </div>
      
      <div className="space-y-3">
        <h4 className="text-[14px] font-bold text-[#1A1A1A] line-clamp-1 group-hover:text-white transition-colors" title={page.title || page.url}>
          {page.title || "UNTITLED_NODE"}
        </h4>
        
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#9A9A9A] uppercase tracking-widest">
                <Globe size={10} />
                Endpoint_Target
            </div>
            <a 
              href={page.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] text-[#1A1A1A] hover:underline font-mono truncate block"
              title={page.url}
            >
              {page.url.replace(/^https?:\/\//, '')}
            </a>
        </div>
      </div>
    </motion.div>
  );
}

export function PageDiscoveryGrid({ onboardingFlowId }: PageDiscoveryGridProps) {
  const [numItems, setNumItems] = useState(20);
  
  const pagesResult = useQuery(api.onboarding.queries.listCrawlPages, {
    onboardingFlowId,
    paginationOpts: { numItems, cursor: null }
  });

  const flow = useQuery(api.onboarding.queries.getOnboardingFlow, {
    onboardingFlowId
  });

  if (!pagesResult || !flow) {
    return (
        <div className="space-y-6">
            <div className="h-10 w-48 bg-white border border-[#E8E8E8] rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-white border border-[#E8E8E8] rounded-2xl animate-pulse" />)}
            </div>
        </div>
    );
  }

  const { page: pages, isDone } = pagesResult;
  const { counts } = flow;

  const hasPages = pages.length > 0;
  const canLoadMore = !isDone && hasPages;

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Database size={14} className="text-[#1A1A1A]" />
                <h2 className="text-[12px] font-mono font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">
                    Discovery Suite
                </h2>
            </div>
            <p className="text-[11px] text-[#9A9A9A] uppercase tracking-widest px-6">Scanning Network Topology</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-[#2E7D32]/5 border-[#2E7D32]/20 text-[#2E7D32] text-[9px] font-mono font-bold uppercase tracking-widest">
                {counts.scrapedCount} SCRAPED
            </Badge>
            <Badge variant="outline" className="bg-[#1A1A1A]/5 border-[#1A1A1A]/20 text-[#1A1A1A] text-[9px] font-mono font-bold uppercase tracking-widest">
                {counts.fetchingCount} FETCHING
            </Badge>
            {counts.failedCount > 0 && (
                <Badge variant="outline" className="bg-red-400/5 border-red-400/20 text-red-400 text-[9px] font-mono font-bold uppercase tracking-widest">
                    {counts.failedCount} FAILED
                </Badge>
            )}
        </div>
      </div>

      {!hasPages ? (
        <div className="h-[200px] flex items-center justify-center border border-dashed border-[#E8E8E8] rounded-xl bg-[#F5F5F5]/50">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 mx-auto text-[#1A1A1A] animate-spin opacity-50" />
            <p className="text-[11px] font-mono font-bold text-[#9A9A9A] uppercase tracking-[0.2em] animate-pulse">Initializing Node Discovery...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
                {pages.map((page, index) => (
                  <PageCard key={`${page.url}-${index}`} page={page} idx={index} />
                ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center pt-4">
              {canLoadMore ? (
                  <Button
                    variant="ghost"
                    onClick={() => setNumItems(prev => prev + 20)}
                    className="h-10 px-6 border border-[#E8E8E8] rounded-full text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-white hover:bg-white"
                  >
                    <ChevronDown size={14} className="mr-2" />
                    Expand Topology
                  </Button>
              ) : isDone && pages.length >= 1 ? (
                  <div className="text-[10px] font-mono text-[#9A9A9A] uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-[#2E7D32]" />
                      Full Network Mapping Complete ({pages.length} Nodes)
                  </div>
              ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
