"use client";

import Image from "next/image";
import {
  Phone,
  Gear,
  Database,
  Lightning,
} from "@phosphor-icons/react";

export function ProblemSection() {
  return (
    <section className="py-24 md:py-32 bg-white" id="platform">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 reveal">
          <div>
            <span className="section-label-coral mb-4 block">Problem → Promise</span>
            <h2 className="text-[#111] text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-[1.15] tracking-tight">
              Outreach is broken when tools don&apos;t work together
            </h2>
          </div>
          <div className="flex items-end">
            <p className="text-[#6b7280] text-base md:text-lg leading-relaxed">
              Your team shouldn&apos;t stitch together lead lists, enrichment,
              copy, voice, sequences, and tracking. Casper replaces
              the messy outbound stack with one workflow.
            </p>
          </div>
        </div>

        {/* Integration Hub - Illustration */}
        <div className="mb-20 reveal flex justify-center w-full max-w-4xl mx-auto">
          <Image 
            src="/problem-promise-illustration.webp" 
            alt="Casper Problem Promise Illustration" 
            width={1000} 
            height={600} 
            className="w-full h-auto object-cover rounded-2xl border border-[#e5e7eb] shadow-sm"
            priority 
          />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 reveal">
          {[
            { icon: <Database size={20} weight="duotone" className="text-[#E8564A]" />, value: "5M+", label: "leads generated" },
            { icon: <Phone size={20} weight="duotone" className="text-[#E8564A]" />, value: "3.1x", label: "higher reply rate" },
            { icon: <Lightning size={20} weight="duotone" className="text-[#E8564A]" />, value: "2.5hrs", label: "saved per campaign" },
            { icon: <Gear size={20} weight="duotone" className="text-[#E8564A]" />, value: "12k", label: "meetings booked" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-3">{stat.icon}</div>
              <span className="text-[#111] text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</span>
              <span className="text-[#9ca3af] text-sm mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
