"use client";

import { useState, useEffect } from "react";
import { SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-[#e5e7eb] shadow-sm"
          : "bg-white border-b border-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center">
            <Image src="/casper.svg" alt="Casper" width={18} height={18} className="brightness-0 invert" />
          </div>
          <span className="text-[#111] font-bold text-lg tracking-tight">Casper</span>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6b7280]">
          <a href="#platform" className="hover:text-[#111] transition-colors">Platform</a>
          <a href="#use-cases" className="hover:text-[#111] transition-colors">Use Cases</a>
          <a href="#pricing" className="hover:text-[#111] transition-colors">Pricing</a>
          <a href="#" className="hover:text-[#111] transition-colors">Book a demo</a>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard/onboarding">
            <button className="text-sm font-medium text-[#6b7280] hover:text-[#111] transition-colors hidden sm:block">
              Sign in
            </button>
          </SignInButton>
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard/onboarding">
            <button className="btn-sendr text-sm py-2 px-4">
              Try free
              <ArrowRight size={14} weight="bold" />
            </button>
          </SignInButton>
        </div>
      </div>
    </header>
  );
}
