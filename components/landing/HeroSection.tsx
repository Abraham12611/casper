"use client";

import { useState, useEffect } from "react";
import { SignInButton } from "@clerk/nextjs";
import { ArrowRight, CurrencyDollar } from "@phosphor-icons/react";

export function HeroSection() {
  const audiences = ["modern dental teams", "Modern Agencies", "Small Businesses", "Freelancers"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % audiences.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white pt-16 pb-8 md:pt-24 md:pb-12">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Heading */}
        <div className="max-w-3xl mb-8 mt-4">
          <h1 className="text-[#111] text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.1] tracking-tight reveal">
            The all-in-one
            <br />
            Outreach CRM for
            <br />
            <span className="text-[#E8564A] transition-opacity duration-500">{audiences[index]}</span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-[#6b7280] text-lg md:text-xl max-w-xl mb-10 leading-relaxed reveal">
          Everything before the meeting is booked, all in one place. Find leads,
          personalise outreach, launch campaigns, and build automations.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 mb-16 reveal">
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard/onboarding">
            <button className="btn-sendr">
              <ArrowRight size={16} weight="bold" />
              Try free
            </button>
          </SignInButton>
          <a href="#pricing" className="btn-sendr-outline">
            <CurrencyDollar size={16} weight="bold" />
            See pricing
          </a>
        </div>

        <p className="text-xs text-[#9ca3af] mb-12 reveal">No card required.</p>

        {/* Product Screenshot */}
        <div className="landing-card overflow-hidden reveal">
          <div className="bg-[#f9fafb] p-4 md:p-6 rounded-xl">
            {/* Mock Table UI */}
            <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
              {/* Table header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e5e7eb]">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#111] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">C</span>
                  </div>
                  <span className="text-sm font-semibold text-[#111]">Prospects</span>
                  <span className="text-xs bg-[#f3f4f6] text-[#6b7280] px-2 py-0.5 rounded-full font-medium">24</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-sendr text-xs py-1.5 px-3 bg-[#E8564A] hover:bg-[#d14a3f]">
                    Enrich data
                  </button>
                </div>
              </div>
              {/* Table rows */}
              <div className="divide-y divide-[#f3f4f6]">
                {[
                  { name: "Whitmore", page: "page.casper.ai/oqwrigtug1", title: "Practice Owner", email: "james.whitmore@brighttooth.io", relocated: "Yes" },
                  { name: "Grant", page: "page.casper.ai/k9vT3pLxQa", title: "Head of Growth", email: "amelia.grant@smilelab.co", relocated: "Yes" },
                  { name: "Chen", page: "page.casper.ai/Zj4nQ8mW2c", title: "Revenue Ops Lead", email: "oliver.chen@dentaledge.ai", relocated: "Just Relocated" },
                  { name: "Laurent", page: "page.casper.ai/1pJ7xVriCk6", title: "Clinic Director", email: "sophie.laurent@eurosmile.io", relocated: "Just Relocated" },
                  { name: "Foster", page: "page.casper.ai/yQ2m8LkP0t", title: "Founder", email: "daniel@fosterdentalgroup.io", relocated: "Yes" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center px-5 py-3 text-sm hover:bg-[#fafafa] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[#6b7280] text-xs font-bold mr-3">
                      {row.name[0]}
                    </div>
                    <div className="w-[120px] font-medium text-[#111] truncate">{row.name}</div>
                    <div className="w-[200px] text-[#9ca3af] text-xs font-mono truncate hidden lg:block">{row.page}</div>
                    <div className="w-[180px] text-[#6b7280] truncate hidden md:block">{row.title}</div>
                    <div className="flex-1 text-[#6b7280] truncate hidden md:block">{row.email}</div>
                    <div className="w-[120px] text-right hidden sm:block">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        row.relocated === "Just Relocated"
                          ? "bg-[#fef3c7] text-[#92400e]"
                          : "bg-[#f0fdf4] text-[#166534]"
                      }`}>
                        {row.relocated}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
