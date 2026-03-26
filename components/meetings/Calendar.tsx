"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { DateTime } from "luxon";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Globe,
  CalendarX2,
  Activity,
  ArrowUpRight,
  Wifi,
  History,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CasperStatCard } from "@/components/ui/CasperStatCard";

// Minimal doc shape for display purposes
export type MeetingDoc = {
  _id: string;
  _creationTime: number;
  agencyId: string;
  opportunityId: string;
  callId: string;
  meetingTime: number; // ms
  createdBy?: string;
  source?: string;
};

type AvailabilityRange = {
  day: number; // 1=Mon ... 7=Sun
  startMinutes: number; // minutes from 00:00
  endMinutes: number;
  raw: string;
};

const dayMap: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function parseAvailabilityWindows(windows: Array<string> | undefined): Array<AvailabilityRange> {
  if (!Array.isArray(windows)) return [];
  const ranges: Array<AvailabilityRange> = [];
  for (const win of windows) {
    const match = win.match(/^(\w{3})\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/);
    if (!match) continue;
    const [, dayAbbr, sh, sm, eh, em] = match;
    const day = dayMap[dayAbbr];
    if (!day) continue;
    const startMinutes = parseInt(sh, 10) * 60 + parseInt(sm, 10);
    const endMinutes = parseInt(eh, 10) * 60 + parseInt(em, 10);
    if (Number.isFinite(startMinutes) && Number.isFinite(endMinutes) && endMinutes > startMinutes) {
      ranges.push({ day, startMinutes, endMinutes, raw: win });
    }
  }
  return ranges;
}

function getWeekStart(dt: DateTime): DateTime {
  const weekday = dt.weekday; // 1..7 (Mon..Sun)
  const diff = weekday - 1; // days since Monday
  return dt.minus({ days: diff }).startOf("day");
}

function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const dt = DateTime.utc().set({ hour: h, minute: m });
  return dt.toFormat("h:mm a");
}

export default function MeetingsCalendar() {
  const agencyProfile = useQuery(api.sellerBrain.getForCurrentUser);
  const [weekOffset, setWeekOffset] = useState(0);

  const meetings = useQuery(
    api.call.meetings.listByAgency,
    agencyProfile?.agencyProfileId ? { agencyId: agencyProfile.agencyProfileId } : "skip"
  ) as unknown as Array<MeetingDoc> | undefined;

  const tz = agencyProfile?.timeZone || "America/New_York";
  const availabilityRanges = useMemo(() => parseAvailabilityWindows(agencyProfile?.availability), [agencyProfile]);

  const nowTz = DateTime.now().setZone(tz);
  const baseWeekStart = getWeekStart(nowTz).plus({ weeks: weekOffset });

  // Get all 7 days of the week
  const allWeekDays: Array<DateTime> = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => baseWeekStart.plus({ days: i }));
  }, [baseWeekStart]);

  const meetingsByDay: Record<number, Array<MeetingDoc>> = useMemo(() => {
    const map: Record<number, Array<MeetingDoc>> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    if (!meetings) return map;
    const start = baseWeekStart.startOf("day").toMillis();
    const end = baseWeekStart.plus({ days: 7 }).endOf("day").toMillis();
    for (const m of meetings) {
      const dt = DateTime.fromMillis(m.meetingTime, { zone: tz });
      const ms = dt.toMillis();
      if (ms < start || ms > end) continue;
      (map[dt.weekday] = map[dt.weekday] || []).push(m);
    }
    for (const k of Object.keys(map)) map[Number(k)]?.sort((a, b) => a.meetingTime - b.meetingTime);
    return map;
  }, [meetings, baseWeekStart, tz]);

  const availabilityByDay: Record<number, Array<AvailabilityRange>> = useMemo(() => {
    const by: Record<number, Array<AvailabilityRange>> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    for (const r of availabilityRanges) (by[r.day] = by[r.day] || []).push(r);
    return by;
  }, [availabilityRanges]);

  const totalMeetings = useMemo(() => {
    return meetings?.length || 0;
  }, [meetings]);

  const weekMeetings = useMemo(() => {
      return Object.values(meetingsByDay).reduce((acc, curr) => acc + curr.length, 0);
  }, [meetingsByDay]);

  const isCurrentWeek = weekOffset === 0;

  if (meetings === undefined) return <MeetingsSkeleton />;

  return (
    <TooltipProvider>
      <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12">
        {/* Header Section */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
            <div className="space-y-2">
                <div className="flex items-center gap-3 mb-1">
                    <History size={20} className="text-[#f97316]" />
                    <span className="text-[12px] font-mono font-bold text-[#f97316] uppercase tracking-[0.2em]">Operational Logistics</span>
                </div>
                <h1 className="text-[32px] font-bold text-[#f0f0f5] tracking-tight">
                    Scheduling Operations
                </h1>
                <p className="text-[#9ca3b4] text-[15px]">
                    Current Window: <span className="text-[#f0f0f5] font-medium">{baseWeekStart.toFormat("MMMM d")} – {baseWeekStart.plus({ days: 6 }).toFormat("MMMM d, yyyy")}</span>
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-[#1e1e2c] border border-[#2a2a3c] rounded-xl flex items-center gap-3 h-12 shadow-sm">
                    <Globe size={14} className="text-[#3b82f6]" />
                    <span className="text-[12px] font-mono font-bold text-[#f0f0f5] uppercase tracking-wider">{tz}</span>
                </div>
                
                <div className="flex items-center bg-[#1e1e2c] border border-[#2a2a3c] rounded-xl p-1 h-12 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setWeekOffset((w) => w - 1)}
                        className="h-10 w-10 text-[#6b7280] hover:text-[#f0f0f5] hover:bg-[#26263a]"
                    >
                        <ChevronLeft size={18} />
                    </Button>
                    <Separator orientation="vertical" className="h-6 bg-[#2a2a3c] mx-1" />
                    <Button
                        onClick={() => setWeekOffset(0)}
                        className={cn(
                            "px-4 h-10 text-[12px] font-bold uppercase tracking-wider transition-all",
                            isCurrentWeek ? "text-[#f97316]" : "text-[#6b7280] hover:text-[#f0f0f5]"
                        )}
                        variant="ghost"
                    >
                        Today
                    </Button>
                    <Separator orientation="vertical" className="h-6 bg-[#2a2a3c] mx-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setWeekOffset((w) => w + 1)}
                        className="h-10 w-10 text-[#6b7280] hover:text-[#f0f0f5] hover:bg-[#26263a]"
                    >
                        <ChevronRight size={18} />
                    </Button>
                </div>
            </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CasperStatCard 
                title="Confirmed Syncs" 
                value={weekMeetings} 
                subtitle="Scheduled for this window"
                accentColor="#f97316"
                delay={1}
            />
            <CasperStatCard 
                title="Total Inventory" 
                value={totalMeetings} 
                subtitle="Lifetime operations logged"
                accentColor="#3b82f6"
                delay={2}
            />
            <CasperStatCard 
                title="Daily Uptime" 
                value={availabilityByDay[nowTz.weekday]?.reduce((acc, r) => acc + (r.endMinutes - r.startMinutes), 0) / 60 || 0} 
                suffix="h"
                subtitle="Active intercept window today"
                accentColor="#22c55e"
                delay={3}
            />
            <CasperStatCard 
                title="Sync Nodes" 
                value={availabilityRanges.length} 
                subtitle="Availability segments defined"
                accentColor="#7b61ff"
                delay={4}
            />
        </div>

        {/* Sync Log Streams */}
        <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="wait">
                <div key={weekOffset} className="space-y-6">
                    {allWeekDays.map((day, idx) => {
                        const weekday = day.weekday as 1 | 2 | 3 | 4 | 5 | 6 | 7;
                        const dayMeetings = meetingsByDay[weekday] || [];
                        const dayAvailability = availabilityByDay[weekday] || [];
                        const isToday = day.hasSame(nowTz, 'day');
                        
                        return (
                            <DailySyncCard 
                                key={day.toISODate()} 
                                day={day} 
                                meetings={dayMeetings} 
                                availability={dayAvailability}
                                isToday={isToday}
                                delay={idx * 0.05}
                            />
                        );
                    })}
                </div>
            </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  );
}

function DailySyncCard({ day, meetings, availability, isToday, delay }: { 
    day: DateTime, 
    meetings: MeetingDoc[], 
    availability: AvailabilityRange[], 
    isToday: boolean,
    delay: number 
}) {
  const hasMeetings = meetings.length > 0;
  const hasAvailability = availability.length > 0;

  return (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className={cn(
            "relative bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px] p-6 transition-all group overflow-hidden",
            isToday ? "ring-1 ring-[#f97316]/30 border-[#f97316]/20 bg-[#22222e]" : "hover:border-[#2e2e40] hover:bg-[#22222e]/50"
        )}
    >
        {isToday && (
            <div className="absolute top-0 right-0 p-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#f97316]/10 border border-[#f97316]/20 rounded-full">
                    <Wifi size={10} className="text-[#f97316] animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-[#f97316] uppercase tracking-wider">ACTIVE CYCLE</span>
                </div>
            </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
            {/* Day Metadata */}
            <div className="w-[200px] shrink-0">
                <h3 className={cn(
                    "text-[20px] font-bold tracking-tight",
                    isToday ? "text-[#f97316]" : "text-[#f0f0f5]"
                )}>
                    {day.toFormat("cccc")}
                </h3>
                <p className="text-[#6b7280] text-[13px] font-mono mb-3">{day.toFormat("MMMM d")}</p>
                
                {hasAvailability ? (
                    <div className="flex flex-wrap gap-1.5">
                        {availability.map((avail, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-[#161621] border-[#2e2e40] text-[#9ca3b4] font-mono group-hover:border-[#f97316]/20 transition-colors">
                                {minutesToLabel(avail.startMinutes)}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <span className="text-[11px] font-mono text-[#52525e] uppercase tracking-widest italic">No Capacity</span>
                )}
            </div>

            {/* Sync Stream */}
            <div className="flex-1 space-y-3">
                {hasMeetings ? (
                    meetings.map((meeting) => (
                        <div 
                            key={meeting._id}
                            className="bg-[#161621] border border-[#2e2e40] rounded-[16px] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group/item hover:border-[#f97316]/40 transition-all cursor-default"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-10 h-10 rounded-xl bg-[#22222e] border border-[#2e2e40] flex items-center justify-center text-[#f97316] group-hover/item:bg-[#f97316]/10 transition-colors">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[15px] font-bold text-[#f0f0f5]">{DateTime.fromMillis(meeting.meetingTime).toFormat("h:mm a")}</span>
                                        <span className="w-1 h-1 rounded-full bg-[#52525e]" />
                                        <span className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider">Follow-up Sync</span>
                                    </div>
                                    <div className="text-[12px] text-[#52525e] font-mono">NODE ID: {meeting._id.slice(-8)}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button asChild variant="ghost" size="sm" className="h-9 rounded-lg px-4 border border-[#2e2e40] bg-[#1a1a26] text-[#9ca3b4] hover:text-[#f0f0f5] hover:border-[#3b82f6]/40">
                                    <Link href={`/dashboard/calls/${meeting.callId}`}>
                                        <ArrowUpRight size={14} className="mr-2" />
                                        Audit Call Transcript
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex items-center justify-center p-8 border border-dashed border-[#2a2a3c] rounded-[24px] opacity-30">
                        <div className="text-center">
                            <CalendarX2 size={24} className="mx-auto mb-2 text-[#52525e]" />
                            <p className="text-[12px] font-mono uppercase tracking-widest">Awaiting scheduled intercepts</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </motion.div>
  );
}

function MeetingsSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto w-full px-6 py-10 space-y-12 animate-pulse">
        <div className="h-20 w-1/3 bg-[#1e1e2c] rounded-2xl" />
        <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[#1e1e2c] border border-[#2a2a3c] rounded-2xl" />)}
        </div>
        <div className="space-y-6">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 bg-[#1e1e2c] border border-[#2a2a3c] rounded-[24px]" />)}
        </div>
    </div>
  );
}
