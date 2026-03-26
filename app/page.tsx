"use client";

import { useConvexAuth } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Target,
  BarChart3,
  Globe,
  Activity
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animations
      gsap.fromTo(
        ".hero-content > *",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: "power3.out" }
      );

      // Floating Artifacts Drift
      gsap.to(".artifact-float-1", {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.to(".artifact-float-2", {
        y: 15,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5
      });

      // Section Scroll Reveals
      gsap.utils.toArray(".scroll-reveal").forEach((elem: any) => {
        gsap.fromTo(
          elem,
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 1, 
            ease: "power3.out",
            scrollTrigger: {
              trigger: elem,
              start: "top 80%"
            }
          }
        );
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={container} className="relative bg-white text-slate-900 font-sans selection:bg-orange-500/30 noise-overlay">
      <Navbar />

      <main>
        <HeroSection />
        <ChallengeSection />
        <RevenueSection />
        <GradientBanner />
        <ExperienceModules />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen bg-delve-hero-gradient flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* Vertical 12-Column Grid Overlay */}
      <div className="absolute inset-0 bg-delve-grid pointer-events-none opacity-20" />
      
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center hero-content">
        <h1 className="flex flex-col gap-4 mb-8">
          <span className="text-white text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Synthesis in days,
          </span>
          <span className="text-white text-6xl md:text-8xl font-serif italic font-medium leading-[0.9]">
            Growth that lasts.
          </span>
        </h1>
        
        <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          Casper automates the synthesis of dental practice outreach, identifying high-intent prospects and closing discovery gaps with AI precision.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard/onboarding">
            <button className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all shadow-xl shadow-orange-900/40 flex items-center gap-2 group">
              Book a Demo <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </SignInButton>
          <button className="text-white border border-white/20 hover:bg-white/10 px-10 py-4 rounded-full font-semibold text-lg transition-all">
            The Platform
          </button>
        </div>
      </div>

      {/* Floating Hero Artifacts */}
      <div className="absolute left-[10%] top-[40%] artifact-card artifact-float-1 hidden lg:flex">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
          <ShieldCheck size={20} />
        </div>
        <div className="text-left">
          <p className="text-white text-xs font-bold uppercase tracking-widest">Compliance</p>
          <p className="text-slate-400 text-sm">HIPAA & GDPR Ready</p>
        </div>
      </div>

      <div className="absolute right-[12%] top-[35%] artifact-card artifact-float-2 hidden lg:flex">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
          <Lock size={20} />
        </div>
        <div className="text-left">
          <p className="text-white text-xs font-bold uppercase tracking-widest">Security</p>
          <p className="text-slate-400 text-sm">SOC 2 Type II</p>
        </div>
      </div>

      <div className="absolute left-[15%] bottom-[15%] artifact-card artifact-float-2 hidden lg:flex">
        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
          <Zap size={20} />
        </div>
        <div className="text-left">
          <p className="text-white text-xs font-bold uppercase tracking-widest">Speed</p>
          <p className="text-slate-400 text-sm">Instant Synthesis</p>
        </div>
      </div>
    </section>
  );
}

function ChallengeSection() {
  return (
    <>
      <div className="section-divider" data-label="The Challenge" />
      <section className="py-32 bg-white flex flex-col items-center">
        <div className="container mx-auto px-6 text-center mb-24 scroll-reveal">
          <h2 className="text-slate-900 text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Outreach busywork <br /> kills momentum.
          </h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Manual prospecting and fragmented outreach tools lead to missed opportunities. Casper consolidates your entire stack into a single, high-fidelity engine.
          </p>
        </div>

        {/* Diagram Area */}
        <div className="relative w-full max-w-6xl h-[600px] flex items-center justify-center scroll-reveal">
          <div className="absolute inset-0 flex justify-between px-20 opacity-10 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-[1px] h-full bg-slate-900" />
            ))}
          </div>

          <div className="relative z-10 text-center">
            <div className="w-32 h-32 rounded-3xl bg-slate-900 flex items-center justify-center mb-6 shadow-2xl mx-auto">
              <Image src="/casper.svg" alt="Casper" width={48} height={48} className="brightness-0 invert" />
            </div>
            <p className="font-bold uppercase tracking-widest text-slate-900 text-sm">Synthesis Engine</p>
          </div>

          <div className="absolute left-[5%] top-[20%] w-64 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="font-bold text-xs uppercase tracking-widest text-slate-500">Notice</span>
            </div>
            <p className="text-slate-800 font-semibold mb-2">High Lead Latency</p>
            <p className="text-slate-500 text-sm leading-relaxed">Manual outreach delays response times by 14+ hours on average.</p>
          </div>

          <div className="absolute right-[5%] bottom-[20%] w-64 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="font-bold text-xs uppercase tracking-widest text-slate-500">Active Task</span>
            </div>
            <p className="text-slate-800 font-semibold mb-3">Syncing Local Data</p>
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-orange-500" />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">EXPORT_FORMAT: JSON_V2</p>
            </div>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
            <path d="M 200,200 Q 500,400 800,200" stroke="#000" fill="none" strokeWidth="2" strokeDasharray="8 8" />
            <path d="M 300,500 Q 500,100 700,500" stroke="#000" fill="none" strokeWidth="2" strokeDasharray="8 8" />
          </svg>
        </div>
      </section>
    </>
  );
}

function RevenueSection() {
  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="scroll-reveal">
          <span className="font-mono text-orange-600 font-bold tracking-widest text-xs uppercase mb-6 block">Section 03 // Revenue Gap</span>
          <h2 className="text-slate-900 text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Every delay in outreach costs you revenue.
          </h2>
          <div className="space-y-6 text-slate-600 text-lg">
            <p>
              In the dental clinical space, local leads grow cold in minutes. Casper's AI initiates contact within seconds of discovery, bridging the gap between "Interested" and "Invoiced".
            </p>
            <div className="flex items-center gap-4 py-4 border-t border-slate-200">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <BarChart3 size={24} />
              </div>
              <p className="font-semibold text-slate-900">+240% increase in discovery call conversion via instant AI synthesis.</p>
            </div>
          </div>
        </div>

        {/* Visual Revenue Artifacts */}
        <div className="relative h-[500px] w-full bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-8 overflow-hidden scroll-reveal">
          <div className="absolute inset-0 bg-delve-grid opacity-5" />
          
          <div className="relative z-10 w-full bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-[10px]">SA</div>
                <div className="text-[10px]">
                  <p className="font-bold text-slate-900">Dr. Sarah Miller</p>
                  <p className="text-slate-400">Miller Dental Clinic</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400">Just now</span>
            </div>
            <p className="text-xs font-semibold text-slate-800 mb-1">Re: Synthesis Results</p>
            <p className="text-xs text-slate-500">I've reviewed the automated audit Casper generated. The identification of our SEO gaps is quite impressive. When can we talk?</p>
          </div>

          <div className="relative z-10 w-full h-40 bg-slate-950 rounded-xl p-6 flex flex-col justify-end gap-4 shadow-xl">
            <div className="flex justify-between items-end gap-2 h-20">
              {[40, 60, 45, 90, 75, 100].map((h, i) => (
                <div 
                  key={i} 
                  className="w-full bg-orange-600 rounded-t-sm" 
                  style={{ height: `${h}%` }} 
                />
              ))}
            </div>
            <div className="flex justify-between text-[8px] font-mono text-slate-500">
              <span>JAN</span>
              <span>FEB</span>
              <span>MAR</span>
              <span>APR</span>
              <span>MAY</span>
              <span>JUN</span>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] w-[120%] bg-red-600 py-3 text-center text-white font-bold tracking-widest text-xs opacity-10 pointer-events-none">
            MANUAL_OUTREACH: CLOSED_LOST
          </div>
        </div>
      </div>
    </section>
  );
}

function GradientBanner() {
  return (
    <section className="py-24 bg-delve-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-delve-grid opacity-10" />
      <div className="container mx-auto px-6 text-center scroll-reveal">
        <h2 className="text-white text-3xl md:text-5xl font-bold tracking-tight mb-8">
          Casper automates the busywork, <br /> so you can orchestrate the growth.
        </h2>
        <button className="text-white border border-white/20 hover:bg-white/10 px-8 py-3 rounded-full font-semibold transition-all">
          Explore the Stack
        </button>
      </div>
    </section>
  );
}

function ExperienceModules() {
  const experiences = [
    {
      title: "Real-time Synthesis",
      desc: "Monitor your AI agents as they process local dental domains and identify specific pain points in real-time.",
      icon: <Activity />,
      image: "https://images.unsplash.com/photo-1551288049-bbda38a594a0?q=80&w=2600&auto=format&fit=crop"
    },
    {
      title: "Unified Outreach",
      desc: "One engine for email, voice, and scheduling. No more fragmented data or broken attribution models.",
      icon: <Target />,
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2600&auto=format&fit=crop"
    },
    {
      title: "Deep Integration",
      desc: "Casper connects directly with your existing CRM to ensure lead flow is never interrupted.",
      icon: <Globe />,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2600&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="space-y-40">
          {experiences.map((exp, i) => (
            <div key={i} className={`flex flex-col lg:flex-row gap-20 items-center scroll-reveal ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 mb-8">
                  {exp.icon}
                </div>
                <h3 className="text-slate-900 text-3xl md:text-5xl font-bold tracking-tight mb-6">{exp.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed">{exp.desc}</p>
              </div>
              <div className="flex-1 w-full aspect-[4/3] bg-slate-100 rounded-[3rem] overflow-hidden border border-slate-200 shadow-2xl relative">
                <Image 
                  src={exp.image} 
                  alt={exp.title} 
                  fill 
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-32 bg-slate-950 flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-4xl mb-12 scroll-reveal">
        <h2 className="text-white text-5xl md:text-7xl font-bold tracking-tight mb-8">
          The bottom line.
        </h2>
        <p className="text-slate-400 text-xl leading-relaxed">
          Ready to scale your dental agency with high-fidelity synthesis? Join the elite group of agencies orchestrating growth with Casper.
        </p>
      </div>
      <div className="scroll-reveal">
        <SignInButton mode="modal">
          <button className="bg-orange-600 hover:bg-orange-500 text-white px-12 py-5 rounded-full font-bold text-xl shadow-2xl shadow-orange-900/40 transition-all flex items-center gap-3 group">
            Get Started <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </SignInButton>
      </div>
    </section>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-6">
      <nav className={`
        flex items-center justify-between w-full max-w-4xl px-8 py-3 
        rounded-full border transition-all duration-300
        ${scrolled 
          ? "bg-white/70 backdrop-blur-xl border-slate-200 shadow-lg" 
          : "bg-white/5 backdrop-blur-md border-white/10 shadow-none"}
      `}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${scrolled ? "bg-slate-900" : "bg-white"}`}>
            <Image src="/casper.svg" alt="L" width={20} height={20} className={scrolled ? "brightness-0 invert" : ""} />
          </div>
          <span className={`font-bold text-lg tracking-tight ${scrolled ? "text-slate-900" : "text-white"}`}>Casper</span>
        </div>

        <div className={`hidden md:flex items-center gap-10 text-sm font-medium ${scrolled ? "text-slate-600" : "text-slate-300"}`}>
          <a href="#" className="hover:text-slate-900 transition-colors">Platform</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Resources</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Security</a>
        </div>

        <div>
          <SignInButton mode="modal">
            <button className={`
              px-6 py-2 rounded-full text-sm font-bold transition-all
              ${scrolled 
                ? "bg-slate-900 text-white hover:bg-slate-800" 
                : "bg-white text-slate-900 hover:bg-slate-100"}
            `}>
              Log In
            </button>
          </SignInButton>
        </div>
      </nav>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-24 px-6 border-t border-white/5">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Image src="/casper.svg" alt="L" width={20} height={20} />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">Casper</span>
            </div>
            <p className="text-slate-400 max-w-md text-lg leading-relaxed">
              Orchestrating high-fidelity dental outbound via automated synthesis. The future of clinical acquisition.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 italic font-serif text-xl">The Platform</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Outreach Engine</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Synthesis API</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Agent Orchestration</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 italic font-serif text-xl">Resources</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Benchmarks</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Audit</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-mono tracking-widest uppercase">
          <p>&copy; 2026 Casper Platform. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
