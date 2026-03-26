"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: number;
  data?: any[];
  accentColor?: string;
  delay?: number;
}

const defaultData = [
  { value: 20 }, { value: 35 }, { value: 25 }, { value: 50 }, { value: 45 }, { value: 65 }
];

export function CasperStatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  data = [],
  accentColor = "#f97316",
  delay = 0
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden bg-[#1e1e2c] border border-[#2a2a3c] rounded-[16px] p-5 hover:border-[#3a3a52] transition-colors group"
    >
      {/* Subtle top glow */}
      <div 
        className="absolute top-0 inset-x-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />
      
      {/* Background soft glow based on accent */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-[#9ca3b4] text-[13px] font-medium mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-[#f0f0f5] tracking-tight">{value}</span>
            {trend !== undefined && (
              <span className={cn(
                "flex items-center text-[12px] font-medium px-1.5 py-0.5 rounded",
                trend >= 0 ? "text-[#22c55e] bg-[#22c55e]/10" : "text-[#ef4444] bg-[#ef4444]/10"
              )}>
                <ArrowUpRight size={12} className={cn("mr-0.5", trend < 0 && "rotate-90")} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#26263a] border border-[#2a2a3c]"
        >
          <TrendingUp size={14} className="text-[#6b7280]" />
        </div>
      </div>

      <div className="h-[40px] mt-2 mb-2 w-full relative z-10 opacity-60 group-hover:opacity-100 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={accentColor} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#gradient-${title.replace(/\s+/g, '-')})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[#52525e] text-[11px] font-medium relative z-10">
        {subtitle}
      </p>
    </motion.div>
  );
}
