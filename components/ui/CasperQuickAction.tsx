"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href?: string;
  delay?: number;
  highlight?: boolean;
  onClick?: () => void;
}

export function CasperQuickAction({ 
  icon, 
  title, 
  subtitle, 
  href,
  delay = 0, 
  highlight = false,
  onClick
}: QuickActionProps) {
  const content = (
    <>
      {/* Background Gradient Layer for active/highlight state */}
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/10 via-[#ea580c]/5 to-transparent z-0 pointer-events-none" />
      )}
      
      {/* Dynamic Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(249,115,22,0.15)_0%,transparent_50%)] z-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div className={cn(
          "w-12 h-12 rounded-[14px] flex items-center justify-center transition-all duration-300",
          highlight 
            ? "bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-[0_4px_16px_rgba(249,115,22,0.4)] text-white" 
            : "bg-[#26263a] text-[#9ca3b4] group-hover:text-[#f0f0f5] group-hover:bg-[#2a2a3c]"
        )}>
          {icon}
        </div>
        
        <div>
          <h3 className={cn(
            "text-[15px] font-semibold mb-1",
            highlight ? "text-white" : "text-[#f0f0f5]"
          )}>
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#6b7280] font-medium">{subtitle}</p>
            <ArrowRight size={14} className={cn(
              "transition-colors transform group-hover:translate-x-1 duration-300",
              highlight ? "text-[#f97316]" : "text-[#52525e] group-hover:text-[#f0f0f5]"
            )} />
          </div>
        </div>
      </div>
    </>
  );

  const className = cn(
    "relative w-full text-left p-6 rounded-[20px] overflow-hidden group border transition-all duration-300 block",
    highlight 
      ? "bg-[#1e1e2c] border-[#f97316]/30 shadow-[0_0_30px_rgba(249,115,22,0.1)]" 
      : "bg-[#1e1e2c] border-[#2a2a3c] hover:border-[#3a3a52]"
  );

  if (href) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: delay * 0.1, ease: [0.23, 1, 0.32, 1] }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link href={href} className={className}>
            {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
    >
      {content}
    </motion.button>
  );
}
