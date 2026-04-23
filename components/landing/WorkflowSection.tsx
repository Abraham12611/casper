"use client";

import {
  MagnifyingGlass,
  ArrowRight,
  UserCirclePlus,
  ShieldCheck,
  EnvelopeSimple,
  Phone,
  UserList,
} from "@phosphor-icons/react";

export function WorkflowSection() {
  return (
    <section className="py-24 md:py-32 bg-[#fafafa] border-t border-[#e5e7eb]" id="use-cases">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 reveal">
          <div>
            <span className="section-label-coral mb-4 block">The Casper Workflow</span>
            <h2 className="text-[#111] text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-[1.15] tracking-tight">
              A single workflow for
              <br />
              every outbound motion
            </h2>
          </div>
          <div className="flex items-end">
            <p className="text-[#6b7280] text-base md:text-lg leading-relaxed">
              Casper is built around one simple loop. From
              identifying a lead to getting a booked meeting.
            </p>
          </div>
        </div>

        {/* 3-Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 reveal-stagger">
          {/* Step 1 - Find contacts */}
          <div className="landing-card p-6 reveal">
            <div className="mb-6">
              {/* Mini table mock */}
              <div className="bg-[#f9fafb] rounded-lg border border-[#e5e7eb] p-4 mb-2">
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-[#9ca3af] mb-3">
                  <span>First name</span>
                  <span>Last name</span>
                </div>
                {[
                  { first: "Hugo", last: "Jenkinson", color: "#E8564A" },
                  { first: "John", last: "Bromley", color: "#3b82f6" },
                  { first: "Hayley", last: "Kearney", color: "#22c55e" },
                ].map((r, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 text-sm py-1.5 border-t border-[#f3f4f6]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ background: r.color }}>
                        {r.first[0]}
                      </div>
                      <span className="text-[#111]">{r.first}</span>
                    </div>
                    <span className="text-[#6b7280]">{r.last}</span>
                  </div>
                ))}
              </div>
              <div className="flex -space-x-2 mt-4 mb-2">
                {["#E8564A", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold" style={{ background: c }}>
                    <UserCirclePlus size={14} weight="fill" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <MagnifyingGlass size={20} weight="bold" className="text-[#111]" />
              <h3 className="text-[#111] text-base font-bold">Find prospects</h3>
            </div>
            <p className="text-[#6b7280] text-sm leading-relaxed mb-3">
              Discover the right dental leads by ICP and intent signals.
            </p>
            <a href="#" className="text-[#111] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Learn more <ArrowRight size={14} weight="bold" />
            </a>
          </div>

          {/* Step 2 - Enrich data */}
          <div className="landing-card p-6 reveal">
            <div className="mb-6">
              <div className="space-y-3">
                {[
                  { icon: <EnvelopeSimple size={16} weight="fill" className="text-[#3b82f6]" />, title: "Write personalised email", desc: "Hugo, still hiring for rev ops..." },
                  { icon: <ShieldCheck size={16} weight="fill" className="text-[#22c55e]" />, title: "Personality analysis complete", desc: "Hugo is high green." },
                  { icon: <UserList size={16} weight="fill" className="text-[#E8564A]" />, title: "Email address found", desc: "hugo@brighttooth.io" },
                ].map((item, i) => (
                  <div key={i} className="bg-[#f9fafb] rounded-lg border border-[#e5e7eb] p-3 flex items-start gap-3">
                    <div className="mt-0.5">{item.icon}</div>
                    <div>
                      <p className="text-[#111] text-sm font-semibold">{item.title}</p>
                      <p className="text-[#9ca3af] text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="bg-[#f9fafb] rounded-lg border border-[#e5e7eb] p-3 flex items-start gap-3">
                  <Phone size={16} weight="fill" className="text-[#8b5cf6] mt-0.5" />
                  <div>
                    <p className="text-[#9ca3af] text-xs">Mobile number found</p>
                    <p className="text-[#111] text-sm font-semibold">+44 7912 ••••••</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck size={20} weight="bold" className="text-[#111]" />
              <h3 className="text-[#111] text-base font-bold">Enrich data</h3>
            </div>
            <p className="text-[#6b7280] text-sm leading-relaxed mb-3">
              Verify contacts and enrich leads with the data that drives replies.
            </p>
            <a href="#" className="text-[#111] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Learn more <ArrowRight size={14} weight="bold" />
            </a>
          </div>

          {/* Step 3 - Send outreach */}
          <div className="landing-card p-6 reveal">
            <div className="mb-6">
              <div className="bg-[#f9fafb] rounded-lg border border-[#e5e7eb] overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-[#111] to-[#333] flex items-center justify-center relative">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#E8564A] flex items-center justify-center text-white text-[8px] font-bold">C</div>
                    <span className="text-white/80 text-xs">AI-generated outreach</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <EnvelopeSimple size={20} weight="bold" className="text-[#111]" />
              <h3 className="text-[#111] text-base font-bold">Send outreach</h3>
            </div>
            <p className="text-[#6b7280] text-sm leading-relaxed mb-3">
              Generate real, relevant outreach that sounds human, not automated.
            </p>
            <a href="#" className="text-[#111] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Learn more <ArrowRight size={14} weight="bold" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
