"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SpinnerGap, WarningCircle, Phone, Envelope, PhoneCall } from "@phosphor-icons/react";

type DemoCallModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: Id<"client_opportunities">;
  agencyId: Id<"agency_profile">;
  casperCreditsBalance: number;
  userEmail: string;
};

export default function DemoCallModal({
  open,
  onOpenChange,
  opportunityId,
  agencyId,
  casperCreditsBalance,
  userEEnvelope,
}: DemoCallModalProps) {
  const router = useRouter();
  const startDemoCall = useAction(api.call.calls.startDemoCall);

  const [phoneNumber, setPhoneNumber] = useState("+1");
  const [eEnvelope, setEmail] = useState(userEmail);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation - allow formatted or unformatted phone numbers
  const phoneRegex = /^\+[1-9][\d\s()\-]{1,18}$/; // Require + at the start, allow formatting chars
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isPhoneValid = phoneRegex.test(phoneNumber);
  const isEmailValid = emailRegex.test(email);
  const hasCredits = casperCreditsBalance >= 1;
  const canSubmit = isPhoneValid && isEmailValid && hasCredits && !isStarting;

  const handleStartDemoCall = async () => {
    if (!canSubmit) return;

    setIsStarting(true);
    setError(null);

    try {
      // Strip formatting and ensure phone number has country code
      let cleanedPhone = phoneNumber.replace(/[^\d+]/g, '');
      if (!cleanedPhone.startsWith('+')) {
        cleanedPhone = `+${cleanedPhone}`;
      }
      
      const result = await startDemoCall({
        opportunityId,
        agencyId,
        overridePhone: cleanedPhone,
        overrideEmail: eEnvelope,
      });

      // Navigate to call detail page
      router.push(`/dashboard/calls/${result.callId}`);
      onOpenChange(false);
    } catch (err) {
      console.error("Start demo call failed:", err);
      const message = err instanceof Error ? err.message : "Failed to start demo call";
      setError(message);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]" variant="glass" showCloseButton={true}>
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-gradient-to-br bg-[#F5F5F5] border border-[#E8E8E8] backdrop-blur-sm">
              <PhoneCall className="h-5 w-5 text-[#1A1A1A]" />
            </div>
            <DialogTitle className="text-2xl font-bold text-[#1A1A1A]">Start Demo Call</DialogTitle>
          </div>
          <DialogDescription className="text-base text-[#6B6B6B]">
            Test the AI calling system with your own contact information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Info Alert */}
          <div className="rounded-lg border border-[#E8E8E8] bg-gradient-to-br bg-[#F5F5F5] backdrop-blur-sm p-4 shadow-md">
            <p className="text-sm text-[#1A1A1A]/90 leading-relaxed">
              This will start a real call to your number with the same AI assistant that would
              call prospects. <span className="font-semibold text-[#1A1A1A]">1 Casper Credit</span> will be charged
              per minute.
              <br />
              <br />
              <span className="font-semibold text-[#1A1A1A]">Note:</span> The business owner will NOT be contacted or notified in any way. 
              This is a private demo for testing only.
            </p>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2.5">
            <Label htmlFor="phone" className="input-label">
              Your Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B] pointer-events-none" />
              <input
                id="phone"
                type="tel"
                placeholder="+1 (202) 555-1234"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  // Remove all non-digit characters except + at the start
                  const digitsOnly = value.replace(/[^\d+]/g, '');
                  
                  // Auto-prepend + if user starts typing without it
                  let cleaned = digitsOnly;
                  if (cleaned && !cleaned.startsWith('+')) {
                    cleaned = '+' + cleaned.replace(/\+/g, ''); // Remove any other + signs
                  }
                  
                  // Format for US/Canada numbers (+1)
                  if (cleaned.startsWith('+1') && cleaned.length > 2) {
                    const countryCode = '+1';
                    const rest = cleaned.slice(2);
                    
                    if (rest.length <= 3) {
                      cleaned = `${countryCode} (${rest}`;
                    } else if (rest.length <= 6) {
                      cleaned = `${countryCode} (${rest.slice(0, 3)}) ${rest.slice(3)}`;
                    } else {
                      cleaned = `${countryCode} (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 10)}`;
                    }
                  }
                  
                  setPhoneNumber(cleaned);
                }}
                style={{ paddingLeft: '2.5rem' }}
                className="input-field"
              />
            </div>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Auto-formatted for US/Canada. For other countries, start with country code.
            </p>
            {phoneNumber && !isPhoneValid && (
              <div className="flex items-center gap-1.5 text-[#C62828]">
                <WarningCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <p className="text-xs font-medium">
                  Invalid format. Example: +1 (202) 555-1234
                </p>
              </div>
            )}
          </div>

          {/* Email Input */}
          <div className="space-y-2.5">
            <Label htmlFor="email" className="input-label">
              Your Email
            </Label>
            <div className="relative">
              <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B] pointer-events-none" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                className="input-field"
              />
            </div>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              If a meeting is booked, you&apos;ll receive <span className="font-semibold text-[#1A1A1A]">both</span> the prospect confirmation 
              and agency summary emails here (for testing purposes)
            </p>
            {email && !isEmailValid && (
              <div className="flex items-center gap-1.5 text-[#C62828]">
                <WarningCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <p className="text-xs font-medium">
                  Invalid email format
                </p>
              </div>
            )}
          </div>

          {/* Credits Warning */}
          {!hasCredits && (
            <Alert variant="destructive" className="border-[#C62828]/20 bg-gradient-to-br bg-[#C62828]/5 backdrop-blur-sm shadow-md">
              <WarningCircle className="h-4 w-4 text-[#C62828] flex-shrink-0" />
              <AlertDescription className="text-sm font-medium text-[#C62828]">
                You need at least 1 Casper credit to start a demo call
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="border-[#C62828]/20 bg-gradient-to-br bg-[#C62828]/5 backdrop-blur-sm shadow-md">
              <WarningCircle className="h-4 w-4 text-[#C62828] flex-shrink-0" />
              <AlertDescription className="text-sm font-medium text-[#C62828]">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-3 pt-3 border-t border-[#E8E8E8]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isStarting}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold border border-[#E8E8E8] bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E8E8E8] hover:border-[#1A1A1A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartDemoCall}
            disabled={!canSubmit}
            className="bg-[#1A1A1A] text-white hover:bg-[#333333] px-5 py-2.5"
          >
            {isStarting ? (
              <>
                <SpinnerGap className="mr-2 h-4 w-4 animate-spin" />
                Starting Call...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                Start Demo Call
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

