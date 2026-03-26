"use client";

import { Loader2, CheckCircle2, XCircle, Circle, Terminal, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventLogProps {
  lastEvent?: {
    type: string;
    message: string;
    timestamp: number;
  };
}

export function EventLog({ lastEvent }: EventLogProps) {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase();
  };

  const getEventIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("started") || t.includes("running") || t.includes("onboarding started")) {
      return <Activity className="w-4 h-4 text-[#3b82f6] animate-pulse" />;
    }
    if (t.includes("completed") || t.includes("complete")) {
      return <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />;
    }
    if (t.includes("error") || t.includes("failed")) {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    return <Terminal className="w-4 h-4 text-[#52525e]" />;
  };

  if (!lastEvent) {
    return (
      <div className="bg-[#161621] border border-[#2e2e40] rounded-2xl p-4 flex items-center justify-between group hover:border-[#3b82f6]/30 transition-all">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1e1e2c] rounded-xl border border-[#2a2a3c]">
                <Terminal className="w-4 h-4 text-[#52525e]" />
            </div>
            <span className="text-[11px] font-mono font-bold text-[#52525e] uppercase tracking-widest">No recent activity</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161621] border border-[#2e2e40] rounded-2xl p-4 flex items-center justify-between group hover:border-[#3b82f6]/30 transition-all ring-1 ring-white/5">
      <div className="flex items-center gap-4 min-w-0">
        <div className="p-2.5 bg-[#1e1e2c] rounded-xl border border-[#2a2a3c] shadow-inner group-hover:bg-[#1e1e2c]/80 transition-colors">
            {getEventIcon(lastEvent.type)}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] text-[#f0f0f5] font-bold group-hover:text-white transition-colors truncate">
            {lastEvent.message}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-[#52525e] uppercase tracking-widest">
                {lastEvent.type}
              </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-mono font-bold text-[#3b82f6] uppercase tracking-widest bg-[#3b82f6]/5 px-2 py-0.5 rounded border border-[#3b82f6]/20">
            {formatTimestamp(lastEvent.timestamp)}
          </span>
      </div>
    </div>
  );
}
