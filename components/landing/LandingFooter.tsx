"use client";

import Image from "next/image";

export function LandingFooter() {
  return (
    <footer className="bg-[#111111] text-white py-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Image src="/casper.svg" alt="Casper" width={18} height={18} />
              </div>
              <span className="font-bold text-lg tracking-tight">Casper</span>
            </div>
            <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs">
              AI-powered outbound calling and scheduling for modern dental teams.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white text-sm font-bold mb-5">Product</h4>
            <ul className="space-y-3 text-[#6b7280] text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Lead Finder</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Voice Calls</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Email Sequences</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Data Enrichment</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-sm font-bold mb-5">Resources</h4>
            <ul className="space-y-3 text-[#6b7280] text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white text-sm font-bold mb-5">Company</h4>
            <ul className="space-y-3 text-[#6b7280] text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[#6b7280] text-xs">
          <p>&copy; 2026 Casper Platform. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
