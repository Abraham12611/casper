"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crosshair,
  SquaresFour, 
  ChartLineUp, 
  Phone, 
  EnvelopeSimple, 
  Buildings, 
  CreditCard,
  CalendarBlank,
  Sparkle,
  Plus,
  CaretDown,
  SignOut,
  SpinnerGap
} from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const miniNavItems = [
  { icon: Crosshair, id: 'logo', isLogo: true, label: "Casper Platform" },
  { icon: SquaresFour, id: 'dashboard', href: '/dashboard', label: "Dashboard" },
  { icon: ChartLineUp, id: 'marketing', href: '/dashboard/marketing', label: "Growth Campaigns" },
  { icon: Phone, id: 'calls', href: '/dashboard/calls', label: "Sales Calls" },
  { icon: EnvelopeSimple, id: 'emails', href: '/dashboard/emails', label: "Messages" },
  { icon: Buildings, id: 'agency', href: '/dashboard/agency', label: "Agency Profile" },
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
      <div className="flex h-screen border-r border-[#E8E8E8] transition-colors duration-300">
        {/* Mini Nav Strip */}
        <div className="w-[56px] bg-white flex flex-col items-center py-3 border-r border-[#E8E8E8] relative z-10 shrink-0">
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
                      className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-white mb-6 cursor-pointer hover:bg-[#000000] transition-all"
                    >
                      <Icon size={18} weight="bold" />
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
                      isActive ? 'bg-[#F5F5F5] text-[#1A1A1A]' : 'text-[#9A9A9A] hover:bg-[#F5F5F5] hover:text-[#6B6B6B]'
                    )}
                  >
                    <Icon size={18} weight={isActive ? "fill" : "regular"} />
                    {isActive && (
                      <motion.div 
                        layoutId="activeMiniNav"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#1A1A1A] rounded-r-full"
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
                className="w-8 h-8 rounded-lg flex items-center justify-center mt-2 text-[#9A9A9A] hover:bg-red-50 hover:text-red-500 transition-all duration-200"
              >
                {isSigningOut ? (
                  <SpinnerGap size={16} className="animate-spin" />
                ) : (
                  <SignOut size={16} />
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
              className="bg-white overflow-hidden flex flex-col h-full shrink-0"
            >
              <div className="p-4 flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#1A1A1A] tracking-wide">
                  {pathname.includes("/marketing") ? "Campaigns" : 
                   pathname.includes("/calls") ? "Sales Calls" : 
                   pathname.includes("/emails") ? "Messages" : "Workspace"}
                </h2>
                <div className="flex gap-2 text-[#9A9A9A]">
                  <Link href="/dashboard/marketing" className="hover:text-[#1A1A1A] transition-colors">
                    <Plus size={16} />
                  </Link>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mt-2 hide-scrollbar font-sans">
                <div className="px-2 mb-6">
                  <SidebarGroup title="Automation">
                    <SidebarItem 
                      href="/dashboard/marketing"
                      icon={<Sparkle size={14} weight="fill" className="text-[#1A1A1A]" />} 
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
                      icon={<EnvelopeSimple size={14} />} 
                      label="Messages" 
                      active={pathname.startsWith("/dashboard/emails")}
                    />
                    <SidebarItem 
                      href="/dashboard/meetings"
                      icon={<CalendarBlank size={14} />} 
                      label="Calendar" 
                      active={pathname.startsWith("/dashboard/meetings")}
                    />
                  </SidebarGroup>

                  <SidebarGroup title="Preferences">
                    <SidebarItem 
                      href="/dashboard/agency"
                      icon={<Buildings size={14} />} 
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
        <h3 className="text-[11px] font-semibold text-[#9A9A9A] uppercase tracking-[0.06em]">{title}</h3>
        <CaretDown size={14} className="text-[#9A9A9A] opacity-0 group-hover:opacity-100 transition-opacity" />
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
        active ? 'bg-[#F5F5F5] text-[#1A1A1A] font-medium' : 'text-[#6B6B6B] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'
      )}
    >
      <span className={active ? 'text-[#1A1A1A]' : 'text-[#9A9A9A] group-hover:text-[#1A1A1A]'}>
        {icon}
      </span>
      <span className="text-[13px] truncate">{label}</span>
    </Link>
  );
}
