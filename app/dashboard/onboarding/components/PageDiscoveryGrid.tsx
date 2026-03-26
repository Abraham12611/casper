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
                return { label: "QUEUED", icon: Terminal, color: "text-[#52525e] border-[#2a2a3c] bg-[#1a1a26]" };
            case "fetching":
                return { label: "FETCHING", icon: Loader2, color: "text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/5", animate: true };
            case "scraped":
                return { label: "SCRAPED", icon: CheckCircle2, color: "text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/5" };
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
        className="group relative bg-[#1e1e2c]/50 border border-[#2a2a3c] rounded-2xl p-4 hover:bg-[#22222e] hover:border-[#3b82f6]/40 transition-all ring-1 ring-white/5 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-3">
        <StatusChip status={page.status} />
        {page.httpStatus && (
            <span className={cn(
                "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border",
                page.httpStatus < 300 ? "text-[#22c55e] border-[#22c55e]/20" : "text-red-400 border-red-400/20"
            )}>
                HTTP_{page.httpStatus}
            </span>
        )}
      </div>
      
      <div className="space-y-3">
        <h4 className="text-[14px] font-bold text-[#f0f0f5] line-clamp-1 group-hover:text-white transition-colors" title={page.title || page.url}>
          {page.title || "UNTITLED_NODE"}
        </h4>
        
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#52525e] uppercase tracking-widest">
                <Globe size={10} />
                Endpoint_Target
            </div>
            <a 
              href={page.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] text-[#3b82f6] hover:underline font-mono truncate block"
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
            <div className="h-10 w-48 bg-[#1e1e2c] border border-[#2a2a3c] rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl animate-pulse" />)}
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
                <Database size={14} className="text-[#3b82f6]" />
                <h2 className="text-[12px] font-mono font-bold text-[#3b82f6] uppercase tracking-[0.2em]">
                    Discovery Suite
                </h2>
            </div>
            <p className="text-[11px] text-[#52525e] uppercase tracking-widest px-6">Scanning Network Topology</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-[#22c55e]/5 border-[#22c55e]/20 text-[#22c55e] text-[9px] font-mono font-bold uppercase tracking-widest">
                {counts.scrapedCount} SCRAPED
            </Badge>
            <Badge variant="outline" className="bg-[#3b82f6]/5 border-[#3b82f6]/20 text-[#3b82f6] text-[9px] font-mono font-bold uppercase tracking-widest">
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
        <div className="h-[200px] flex items-center justify-center border border-dashed border-[#2a2a3c] rounded-[32px] bg-[#161621]/50">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 mx-auto text-[#3b82f6] animate-spin opacity-50" />
            <p className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-[0.2em] animate-pulse">Initializing Node Discovery...</p>
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
                    className="h-10 px-6 border border-[#2a2a3c] rounded-full text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#9ca3b4] hover:text-white hover:bg-[#1e1e2c]"
                  >
                    <ChevronDown size={14} className="mr-2" />
                    Expand Topology
                  </Button>
              ) : isDone && pages.length >= 1 ? (
                  <div className="text-[10px] font-mono text-[#52525e] uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-[#22c55e]" />
                      Full Network Mapping Complete ({pages.length} Nodes)
                  </div>
              ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
