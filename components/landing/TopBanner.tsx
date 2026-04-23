"use client";

import { ArrowRight } from "@phosphor-icons/react";

export function TopBanner() {
  return (
    <div className="w-full bg-[#111111] text-white text-center py-2.5 px-4 text-sm font-medium">
      <span className="opacity-90">
        Welcome to Casper — 
      </span>
      <a href="#pricing" className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80 transition-opacity ml-1">
        start your free trial today!
        <ArrowRight size={14} weight="bold" />
      </a>
    </div>
  );
}
