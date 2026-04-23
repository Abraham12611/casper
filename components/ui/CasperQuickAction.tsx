"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
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
      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
          highlight 
            ? "bg-[#1A1A1A] text-white" 
            : "bg-[#F5F5F5] text-[#6B6B6B] group-hover:text-[#1A1A1A] group-hover:bg-[#EFEFEF]"
        )}>
          {icon}
        </div>
        
        <div>
          <h3 className="text-[15px] font-semibold mb-1 text-[#1A1A1A]">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#6B6B6B] font-medium">{subtitle}</p>
            <ArrowRight size={14} className={cn(
              "transition-all transform group-hover:translate-x-1 duration-300",
              highlight ? "text-[#1A1A1A]" : "text-[#9A9A9A] group-hover:text-[#1A1A1A]"
            )} />
          </div>
        </div>
      </div>
    </>
  );

  const className = cn(
    "relative w-full text-left p-6 rounded-xl overflow-hidden group border transition-all duration-300 block",
    highlight 
      ? "bg-white border-[#1A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.08)]" 
      : "bg-white border-[#E8E8E8] hover:border-[#CCCCCC] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
  );

  if (href) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: delay * 0.1, ease: [0.23, 1, 0.32, 1] }}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
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
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={className}
    >
      {content}
    </motion.button>
  );
}
