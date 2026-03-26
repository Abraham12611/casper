"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, 
  Plus, 
  ChevronDown, 
  Mail, 
  Phone, 
  LayoutGrid, 
  Users, 
  Settings, 
  Activity, 
  Sparkles, 
  Target, 
  LogOut,
  Loader2,
  Calendar,
  CreditCard,
  Building2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const miniNavItems = [
  { icon: Target, id: 'logo', isLogo: true, label: "Casper Platform" },
  { icon: LayoutGrid, id: 'dashboard', href: '/dashboard', label: "Dashboard" },
  { icon: Activity, id: 'marketing', href: '/dashboard/marketing', label: "Growth Campaigns" },
  { icon: Phone, id: 'calls', href: '/dashboard/calls', label: "Sales Calls" },
  { icon: Mail, id: 'emails', href: '/dashboard/emails', label: "Messages" },
  { icon: Users, id: 'agency', href: '/dashboard/agency', label: "Agency Profile" },
  { icon: CreditCard, id: 'billing', bottom: true, href: '/dashboard/subscription', label: "Credits & Billing" }
];

export function CasperSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = React.useState(true);
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      setIsSigningOut(false);
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen border-r border-[#2a2a3c] transition-colors duration-300">
        {/* Mini Nav Strip */}
        <div className="w-[56px] bg-[#0d0d13] flex flex-col items-center py-3 border-r border-[#2a2a3c] relative z-10 shrink-0">
          {miniNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href ? (
              item.href === "/dashboard" 
                ? pathname === "/dashboard" 
                : pathname.startsWith(item.href)
            ) : false;
            
            if (item.isLogo) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <div 
                      onClick={() => setExpanded(!expanded)}
                      className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-white mb-6 cursor-pointer hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all"
                    >
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{expanded ? "Collapse Sidebar" : "Expand Sidebar"}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href || "#"}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-all duration-200 relative group",
                      item.bottom ? 'mt-auto' : '',
                      isActive ? 'bg-[#26263a] text-[#f0f0f5]' : 'text-[#6b7280] hover:bg-[#22222e] hover:text-[#9ca3af]'
                    )}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                    {isActive && (
                      <motion.div 
                        layoutId="activeMiniNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#f97316] rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          
          {/* Sign Out Button in Mini Nav */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-8 h-8 rounded-lg flex items-center justify-center mt-2 text-[#6b7280] hover:bg-[#ef4444]/10 hover:text-[#ef4444] transition-all duration-200"
              >
                {isSigningOut ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Sign Out</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Expandable Sidebar Panel */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-[#161621] overflow-hidden flex flex-col h-full shrink-0"
            >
              <div className="p-4 flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#f0f0f5] tracking-wide">
                  {pathname.includes("/marketing") ? "Operations" : 
                   pathname.includes("/calls") ? "Automated Sales" : 
                   pathname.includes("/emails") ? "Client Messages" : "Agency Command"}
                </h2>
                <div className="flex gap-2 text-[#6b7280]">
                  <Link href="/dashboard/marketing" className="hover:text-[#9ca3af] transition-colors">
                    <Plus size={16} />
                  </Link>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mt-2 hide-scrollbar font-sans">
                <div className="px-2 mb-6">
                  <SidebarGroup title="Automation">
                    <SidebarItem 
                      href="/dashboard/marketing"
                      icon={<Sparkles size={14} className="text-[#f97316]" />} 
                      label="Lead Generation" 
                      active={pathname.startsWith("/dashboard/marketing")} 
                    />
                    <SidebarItem 
                      href="/dashboard/calls"
                      icon={<Phone size={14} />} 
                      label="Sales Calls" 
                      active={pathname.startsWith("/dashboard/calls")}
                    />
                    <SidebarItem 
                      href="/dashboard/emails"
                      icon={<Mail size={14} />} 
                      label="Messages" 
                      active={pathname.startsWith("/dashboard/emails")}
                    />
                    <SidebarItem 
                      href="/dashboard/meetings"
                      icon={<Calendar size={14} />} 
                      label="Calendar" 
                      active={pathname.startsWith("/dashboard/meetings")}
                    />
                  </SidebarGroup>

                  <SidebarGroup title="Preferences">
                    <SidebarItem 
                      href="/dashboard/agency"
                      icon={<Building2 size={14} />} 
                      label="Agency Profile" 
                      active={pathname.startsWith("/dashboard/agency")}
                    />
                    <SidebarItem 
                      href="/dashboard/subscription"
                      icon={<CreditCard size={14} />} 
                      label="Credits & Billing" 
                      active={pathname.startsWith("/dashboard/subscription")}
                    />
                  </SidebarGroup>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}

function SidebarGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="px-3 py-2 flex items-center justify-between group cursor-pointer">
        <h3 className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-[0.06em]">{title}</h3>
        <ChevronDown size={14} className="text-[#6b7280] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-col gap-[1px]">
        {children}
      </div>
    </div>
  );
}

function SidebarItem({ 
    icon, 
    label, 
    active,
    href
}: { 
    icon: React.ReactNode, 
    label: string, 
    active?: boolean,
    href: string
}) {
  return (
    <Link 
      href={href}
      className={cn(
        "w-full h-8 px-3 rounded-md flex items-center gap-2.5 transition-colors duration-150 group",
        active ? 'bg-[#26263a] text-[#f0f0f5] font-medium' : 'text-[#9ca3b4] hover:bg-[#22222e] hover:text-[#f0f0f5]'
      )}
    >
      <span className={active ? 'text-inherit' : 'text-[#6b7280] group-hover:text-inherit'}>
        {icon}
      </span>
      <span className="text-[13px] truncate">{label}</span>
    </Link>
  );
}
