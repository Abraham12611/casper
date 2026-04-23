"use client";

import { useState, useEffect } from "react";
import { SignInButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Check,
  Sparkle,
  Star,
  Lightning,
  Robot,
  Globe,
  Users,
  PaintBrush,
  Link as LinkIcon,
} from "@phosphor-icons/react";

export function PricingSection() {
  const testimonials = [
    {
      quote: "We booked 50 meetings out of 500 dental practice leads with Casper AI calls.",
      initials: "RD",
      name: "Rob Dumbleton",
      title: "CEO at FourFour Dental",
    },
    {
      quote: "Casper completely transformed how our agency handles outbound. Our reply rates tripled.",
      initials: "SJ",
      name: "Sarah Jenkins",
      title: "Founder at Spark Agency",
    },
    {
      quote: "As a freelancer, I don't have time for manual outreach. Casper does the heavy lifting for me.",
      initials: "MK",
      name: "Mike Kova",
      title: "Independent Consultant",
    },
    {
      quote: "We scaled our small business lead generation without having to hire a massive sales team.",
      initials: "LT",
      name: "Laura Thompson",
      title: "Head of Growth, Apex SMB",
    }
  ];

  const [tIndex, setTIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 md:py-32 bg-[#fafafa] border-t border-[#e5e7eb]" id="pricing">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Left - Label + Testimonial */}
          <div className="lg:col-span-4 reveal">
            <span className="section-label-coral mb-4 block">Plans & Pricing</span>
            <h2 className="text-[#111] text-3xl sm:text-4xl font-bold leading-[1.15] tracking-tight mb-16">
              Start small,
              <br />
              scale when it
              <br />
              works
            </h2>

            {/* Testimonial */}
            <blockquote className="border-l-2 border-[#e5e7eb] pl-6 mb-8 min-h-[160px] flex flex-col justify-center">
              <p className="text-[#111] text-lg md:text-xl font-semibold leading-snug mb-4 transition-opacity duration-500 ease-in-out">
                &ldquo;{testimonials[tIndex].quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center text-white text-sm font-bold">
                  {testimonials[tIndex].initials}
                </div>
                <div>
                  <p className="text-[#111] text-sm font-semibold">{testimonials[tIndex].name}</p>
                  <p className="text-[#9ca3af] text-xs">{testimonials[tIndex].title}</p>
                </div>
              </div>
            </blockquote>
          </div>

          {/* Right - Pricing Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 reveal">
            {/* Growth */}
            <div className="landing-card p-6 md:p-8 flex flex-col">
              <h3 className="text-[#111] text-lg font-bold mb-1">Growth</h3>
              <p className="text-[#9ca3af] text-xs mb-6">Core outbound engine</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[#E8564A] text-4xl font-bold">$97</span>
                <span className="text-[#9ca3af] text-sm">/ month</span>
              </div>
              <p className="text-[#6b7280] text-sm mb-8 leading-relaxed">
                Everything you need to run personalised outbound that stands out.
              </p>

              <div className="mb-8">
                <p className="text-[#111] text-xs font-bold uppercase tracking-wider mb-4">Key Features</p>
                <div className="space-y-3">
                  {[
                    { icon: <Check size={14} weight="bold" />, label: "2,500 credits" },
                    { icon: <Star size={14} weight="fill" />, label: "500 AI voice calls" },
                    { icon: <Sparkle size={14} weight="fill" />, label: "Lead finder" },
                    { icon: <Robot size={14} weight="fill" />, label: "Data studio" },
                    { icon: <Lightning size={14} weight="fill" />, label: "Dynamic pages & sequences" },
                    { icon: <Users size={14} weight="fill" />, label: "Private community" },
                    { icon: <Globe size={14} weight="fill" />, label: "Chrome extension" },
                    { icon: <LinkIcon size={14} weight="fill" />, label: "Live onboarding session" },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-[#6b7280] text-sm">
                      <span className="text-[#E8564A]">{feat.icon}</span>
                      {feat.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <SignInButton mode="modal" fallbackRedirectUrl="/dashboard/onboarding">
                  <button className="btn-sendr w-full justify-center">
                    <ArrowRight size={16} weight="bold" />
                    Start free trial
                  </button>
                </SignInButton>
              </div>
            </div>

            {/* Pro */}
            <div className="landing-card p-6 md:p-8 flex flex-col border-[#E8564A]/30 shadow-lg shadow-[#E8564A]/5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[#111] text-lg font-bold">Pro</h3>
              </div>
              <p className="text-[#9ca3af] text-xs mb-6">Automation & scale</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[#E8564A] text-4xl font-bold">$249</span>
                <span className="text-[#9ca3af] text-sm">/ month</span>
              </div>
              <p className="text-[#6b7280] text-sm mb-8 leading-relaxed">
                Built for teams turning outbound into a scalable engine.
              </p>

              <div className="mb-8">
                <p className="text-[#111] text-xs font-bold uppercase tracking-wider mb-4">Everything in Growth +</p>
                <div className="space-y-3">
                  {[
                    { icon: <Check size={14} weight="bold" />, label: "20,000 credits" },
                    { icon: <Star size={14} weight="fill" />, label: "1,000 AI voice calls" },
                    { icon: <Robot size={14} weight="fill" />, label: "Automation builder" },
                    { icon: <LinkIcon size={14} weight="fill" />, label: "API & Webhooks" },
                    { icon: <Users size={14} weight="fill" />, label: "Unlimited team" },
                    { icon: <PaintBrush size={14} weight="fill" />, label: "Remove branding" },
                    { icon: <Globe size={14} weight="fill" />, label: "Custom domain" },
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-[#6b7280] text-sm">
                      <span className="text-[#E8564A]">{feat.icon}</span>
                      {feat.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <SignInButton mode="modal" fallbackRedirectUrl="/dashboard/onboarding">
                  <button className="w-full justify-center btn-sendr bg-[#E8564A] hover:bg-[#d14a3f]">
                    <ArrowRight size={16} weight="bold" />
                    Start free trial
                  </button>
                </SignInButton>
                <p className="text-center text-[#9ca3af] text-xs mt-3">Add-ons available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
