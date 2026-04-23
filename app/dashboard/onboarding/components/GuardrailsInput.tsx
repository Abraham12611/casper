"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, ShieldX, Plus, Terminal, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface GuardrailsInputProps {
  guardrails: string[];
  onGuardrailsChange: (guardrails: string[]) => void;
}

export function GuardrailsInput({ guardrails, onGuardrailsChange }: GuardrailsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddGuardrail = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
    
    if (guardrails.includes(trimmedValue)) {
      setInputValue("");
      return;
    }
    
    onGuardrailsChange([...guardrails, trimmedValue]);
    setInputValue("");
  };

  const handleRemoveGuardrail = (guardrailToRemove: string) => {
    onGuardrailsChange(guardrails.filter(g => g !== guardrailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddGuardrail();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#F5F5F5] border border-[#E2E2E2] rounded-2xl p-5 ">
        <div className="flex items-start gap-4">
            <div className="p-2 bg-white rounded-xl border border-[#E8E8E8]">
                <Shield size={16} className="text-[#1A1A1A]" />
            </div>
            <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-[#1A1A1A] uppercase tracking-[0.2em]">Logic Constraints</span>
                <p className="text-[12px] text-[#9A9A9A] leading-relaxed">
                    Define operational boundaries for the AI agent. These instructions serve as primary cognitive filters during prospect engagement.
                </p>
            </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-[12px] font-mono font-bold text-[#9A9A9A] uppercase tracking-[0.2em] px-1">Initialize_Rule</Label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-12 bg-[#F5F5F5] border-[#E2E2E2] rounded-2xl text-[14px] text-[#1A1A1A] placeholder:text-[#9A9A9A] focus:border-[#1A1A1A]/50 focus:ring-4 focus:ring-[#1A1A1A]/10 transition-all font-mono"
            placeholder="System instruction (e.g., 'Never mention pricing before qualification')"
            maxLength={200}
          />
          <button
            onClick={handleAddGuardrail}
            disabled={!inputValue.trim()}
            className="flex items-center gap-2 px-6 bg-[#1A1A1A] hover:bg-[#2563eb] text-white rounded-2xl text-[12px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-[#1A1A1A]/20"
          >
            <Plus size={14} />
            Commit
          </button>
        </div>
      </div>

      {guardrails.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
                {guardrails.map((guardrail, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group flex items-center gap-3 bg-white border border-[#E8E8E8] rounded-xl px-4 py-2 hover:border-[#1A1A1A]/40 transition-all "
                  >
                    <Zap size={12} className="text-[#1A1A1A] opacity-50 group-hover:opacity-100" />
                    <span className="text-[13px] text-[#1A1A1A] font-medium max-w-xs truncate" title={guardrail}>
                      {guardrail}
                    </span>
                    <button
                      onClick={() => handleRemoveGuardrail(guardrail)}
                      className="w-5 h-5 rounded-lg flex items-center justify-center bg-red-400/5 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      aria-label={`Remove guardrail: ${guardrail}`}
                    >
                      <ShieldX size={12} />
                    </button>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {guardrails.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[#E8E8E8] rounded-xl bg-[#F5F5F5]/30">
          <Terminal size={20} className="text-[#9A9A9A] mb-3 opacity-30" />
          <p className="text-[11px] font-mono font-bold text-[#9A9A9A] uppercase tracking-[0.2em] text-center max-w-[200px]">
            No constraint protocols loaded. Initializing baseline logic.
          </p>
        </div>
      )}
    </div>
  );
}
