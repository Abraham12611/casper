"use client";

import {
  Target,
  UsersFour,
  ChartLineUp,
  Robot,
  CalendarCheck,
  Sparkle,
} from "@phosphor-icons/react";

export function FeaturesEngine() {
  return (
    <section className="py-24 md:py-32 bg-white border-t border-[#e5e7eb]">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-16 reveal">
          <span className="section-label-coral mb-4 block">The Engine</span>
          <h2 className="text-[#111] text-3xl sm:text-4xl md:text-[2.75rem] font-bold leading-[1.15] tracking-tight mb-6">
            Everything you need
            <br />
            to run outbound —
            <br />
            without the chaos
          </h2>
          <p className="text-[#6b7280] text-base md:text-lg leading-relaxed">
            Built for dental outbound workflows, not for stitching tools together.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
          {[
            {
              icon: <Target size={24} weight="duotone" />,
              title: "Campaigns powered by real intent",
              desc: "Launch sequences that adapt to page visits, voice replies, and buying signals.",
              color: "#E8564A",
            },
            {
              icon: <Robot size={24} weight="duotone" />,
              title: "AI-led personalisation",
              desc: "Voice calls and dynamic pages that feel intentional, not automated.",
              color: "#3b82f6",
            },
            {
              icon: <ChartLineUp size={24} weight="duotone" />,
              title: "Pipeline visibility",
              desc: "Real-time tracking from first touch to booked appointment.",
              color: "#22c55e",
            },
            {
              icon: <UsersFour size={24} weight="duotone" />,
              title: "Lead scoring & routing",
              desc: "Prioritise the hottest dental practices and route to the right rep.",
              color: "#f59e0b",
            },
            {
              icon: <CalendarCheck size={24} weight="duotone" />,
              title: "Automated scheduling",
              desc: "Book discovery calls directly into your team's calendar without friction.",
              color: "#8b5cf6",
            },
            {
              icon: <Sparkle size={24} weight="duotone" />,
              title: "Smart follow-ups",
              desc: "Multi-channel sequences that adapt based on prospect engagement signals.",
              color: "#E8564A",
            },
          ].map((feat, i) => (
            <div key={i} className="landing-card p-6 reveal">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${feat.color}15`, color: feat.color }}
              >
                {feat.icon}
              </div>
              <h3 className="text-[#111] text-base font-bold mb-2">{feat.title}</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
