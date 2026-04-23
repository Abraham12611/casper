"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

const faqs = [
  {
    q: "What exactly is a credit?",
    a: "A credit is a unit of usage that covers one AI-enriched action — whether that's an email sent, a voice call made, or a lead enriched with contact data. Different actions may consume different amounts of credits.",
  },
  {
    q: "What happens when credits run out?",
    a: "You'll receive a notification when you're running low. You can purchase additional credits at any time or upgrade your plan. Existing campaigns will pause gracefully until credits are replenished.",
  },
  {
    q: "Do I still need other outbound tools?",
    a: "No. Casper replaces your lead finder, enrichment tool, email sequencer, and AI dialler in one platform. Most teams eliminate 4–5 separate subscriptions after switching.",
  },
  {
    q: "Is Casper HIPAA compliant?",
    a: "Yes. We take dental practice data security seriously. Casper is HIPAA compliant and implements end-to-end encryption for all patient-adjacent data handling.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Absolutely. You can switch plans at any time from your dashboard. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 bg-white border-t border-[#e5e7eb]">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left label */}
          <div className="lg:col-span-4 reveal">
            <h2 className="text-[#111] text-2xl md:text-3xl font-bold tracking-tight mb-2">Quick answers</h2>
            <p className="text-[#9ca3af] text-sm">The essentials, in under a minute.</p>
          </div>

          {/* Right - FAQ items */}
          <div className="lg:col-span-8 reveal">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <CaretDown
                    size={18}
                    weight="bold"
                    className={`text-[#9ca3af] transition-transform duration-300 flex-shrink-0 ml-4 ${
                      open === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div className={`faq-answer ${open === i ? "open" : ""}`}>
                  <p className="text-[#6b7280] text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
