"use client";

import { useConvexAuth } from "convex/react";
import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  TopBanner,
  LandingNavbar,
  HeroSection,
  LogoTicker,
  ProblemSection,
  WorkflowSection,
  FeaturesEngine,
  PricingSection,
  FaqSection,
  LandingFooter,
} from "@/components/landing";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  return <LandingPage />;
}

function LandingPage() {
  const container = useRef<HTMLDivElement>(null);

  // IntersectionObserver-based scroll reveals
  const setupRevealObserver = useCallback(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const els = container.current?.querySelectorAll(".reveal");
    els?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cleanup = setupRevealObserver();
    return cleanup;
  }, [setupRevealObserver]);

  return (
    <div ref={container} className="landing-sendr bg-white text-[#111111]">
      <TopBanner />
      <LandingNavbar />

      <main>
        <HeroSection />
        <LogoTicker />
        <ProblemSection />
        <WorkflowSection />
        <FeaturesEngine />
        <PricingSection />
        <FaqSection />
      </main>

      <LandingFooter />
    </div>
  );
}
