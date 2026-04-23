"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowUpRight, TrendUp } from "@phosphor-icons/react";
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
  accentColor = "#9A9A9A",
  delay = 0
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden bg-white border border-[#E8E8E8] rounded-xl p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all group"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-[#6B6B6B] text-[13px] font-medium mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-[#1A1A1A] tracking-tight">{value}</span>
            {trend !== undefined && (
              <span className={cn(
                "flex items-center text-[12px] font-medium px-1.5 py-0.5 rounded",
                trend >= 0 ? "text-[#2E7D32] bg-[#E8F5E9]" : "text-[#C62828] bg-[#FDECEA]"
              )}>
                <ArrowUpRight size={12} className={cn("mr-0.5", trend < 0 && "rotate-90")} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
        
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F5] border border-[#E8E8E8]"
        >
          <TrendUp size={14} className="text-[#9A9A9A]" />
        </div>
      </div>

      <div className="h-[40px] mt-2 mb-2 w-full relative z-10 opacity-40 group-hover:opacity-70 transition-opacity">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E8E8E8" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#E8E8E8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#9A9A9A" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill={`url(#gradient-${title.replace(/\s+/g, '-')})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[#9A9A9A] text-[11px] font-medium relative z-10">
        {subtitle}
      </p>
    </motion.div>
  );
}
