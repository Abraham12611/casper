import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal, components } from "../_generated/api";
// casperAgentFast import removed
import type { Doc } from "../_generated/dataModel";
import { createThread } from "@convex-dev/agent";

type BookingAnalysis = {
  meetingBooked: boolean;
  slotIso: string | undefined;
  confidence: number;
  reasoning: string;
  rejectionDetected: boolean;
  summary: string | undefined;
};

function cleanJsonString(input: string): string {
  let cleaned = input.trim();
  // Strip starting ```json or ```
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  // Strip ending ```
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export const processCallTranscript = internalAction({
  args: {
    callId: v.id("calls"),
  },
  returns: v.null(),
  handler: async (ctx, { callId }) => {
    console.log(`[AI Analysis] Starting transcript analysis for call ${callId}`);

    // Load call record with all related data
    const call: Doc<"calls"> | null = await ctx.runQuery(
      internal.call.calls.getCallByIdInternal,
      { callId }
    );
    
    if (!call) {
      console.error(`[AI Analysis] Call ${callId} not found`);
      return null;
    }

    if (!call.transcript || call.transcript.length === 0) {
      console.warn(`[AI Analysis] No transcript available for call ${callId}`);
      return null;
    }

    // Load opportunity and agency for context
    const opportunity = await ctx.runQuery(
      internal.leadGen.queries.getOpportunityById,
      { opportunityId: call.opportunityId }
    );
    
    const agency = await ctx.runQuery(
      internal.leadGen.queries.getAgencyProfileInternal,
      { agencyId: call.agencyId }
    );

    if (!opportunity || !agency) {
      console.error(`[AI Analysis] Missing opportunity or agency data for call ${callId}`);
      return null;
    }

    // Recompute availability grid for validation
    const availabilityData = await ctx.runQuery(
      internal.call.availability.getAvailableSlots,
      { agencyId: call.agencyId }
    );

    console.log(`[AI Analysis] Available slots: ${availabilityData.slots.length}, Agency TZ: ${agency.timeZone ?? "America/New_York"}`);

    // Aggregate transcript text ordered by timestamp
    const transcriptText = call.transcript
      .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
      .map(fragment => `${fragment.role}: ${fragment.text}`)
      .join('\n');

    // Build AI prompt for meeting booking analysis
    const availableSlotsText = availabilityData.slots
      .slice(0, 10) // Limit to first 10 slots to keep prompt manageable
      .map((slot: any) => `"${slot.iso}" (${slot.label})`)
      .join(', ');

    const prompt = `Analyze this sales call transcript to determine if a meeting was booked, detect any rejections, and write a high-quality professional summary.

CONTEXT:
- Company: ${agency.companyName}
- Prospect: ${opportunity.name}
- Call transcript:
${transcriptText}

AVAILABLE MEETING SLOTS:
${availableSlotsText || "No available slots"}

INSTRUCTIONS:
1. Determine if a specific meeting time was agreed upon during the call
2. If yes, identify the exact time slot from the available options above
3. Assess confidence level (0-100) in your determination
4. Detect if the prospect explicitly rejected the offer or meeting request
5. Provide clear reasoning for your decision
6. Generate a professional 2-3 sentence summary of the call conversation, outline what was discussed, the prospect's stance, and the ultimate outcome.

Respond with valid JSON only:
{
  "meetingBooked": boolean,
  "slotIso": "YYYY-MM-DDTHH:mm:ss.sssZ" or null,
  "confidence": number (0-100),
  "reasoning": "string explaining your decision",
  "rejectionDetected": boolean,
  "summary": "a professional 2-3 sentence summary outlining the call conversation and outcome"
}

VALIDATION RULES:
- slotIso must exactly match one of the available slots listed above
- Only set meetingBooked=true if there's explicit agreement on a specific time
- Set rejectionDetected=true if prospect clearly declined the offer/meeting
- Confidence should reflect how certain you are based on the transcript clarity`;

    try {
      console.log(`[AI Analysis] Sending transcript to AI for analysis (${transcriptText.length} chars)`);
      
      console.log(`[AI Analysis] Running standard generateText via Kimi k2.5 on OpenRouter...`);
      const { generateText } = require("ai");
      const { createOpenAI } = require("@ai-sdk/openai");

      const openrouter = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY || "missing-key",
        compatibility: "compatible",
      });

      const MODEL = process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2.5";

      const response = await generateText({
        model: openrouter(MODEL),
        prompt: prompt,
      });

      console.log(`[AI Analysis] AI response received: ${response.text?.substring(0, 200)}...`);

      // Parse JSON response defensively
      let analysis: BookingAnalysis;
      try {
        const cleanedText = cleanJsonString(response.text || "{}");
        const parsed = JSON.parse(cleanedText);
        analysis = {
          meetingBooked: Boolean(parsed.meetingBooked),
          slotIso: typeof parsed.slotIso === "string" ? parsed.slotIso : undefined,
          confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 0)),
          reasoning: String(parsed.reasoning || "No reasoning provided"),
          rejectionDetected: Boolean(parsed.rejectionDetected),
          summary: typeof parsed.summary === "string" ? parsed.summary : undefined,
        };
      } catch (parseError) {
        console.error(`[AI Analysis] Failed to parse AI response as JSON:`, parseError);
        analysis = {
          meetingBooked: false,
          slotIso: undefined,
          confidence: 0,
          reasoning: "Failed to parse AI response",
          rejectionDetected: false,
          summary: undefined,
        };
      }

      // Validate slot against available options if meeting was booked
      if (analysis.meetingBooked && analysis.slotIso) {
        const isValidSlot = await ctx.runQuery(
          internal.call.availability.validateSlot,
          { agencyId: call.agencyId, slotIso: analysis.slotIso }
        );

        if (!isValidSlot) {
          console.warn(`[AI Analysis] AI suggested invalid slot: ${analysis.slotIso}`);
          analysis.meetingBooked = false;
          analysis.slotIso = undefined;
          analysis.confidence = Math.max(0, analysis.confidence - 30);
          analysis.reasoning += " (AI suggested unavailable time slot)";
        }
      }

      // Apply confidence threshold
      const CONFIDENCE_THRESHOLD = 70;
      if (analysis.confidence < CONFIDENCE_THRESHOLD) {
        console.warn(`[AI Analysis] Low confidence (${analysis.confidence}), not taking action`);
        analysis.meetingBooked = false;
        analysis.slotIso = undefined;
      }

      console.log(`[AI Analysis] Final analysis:`, {
        meetingBooked: analysis.meetingBooked,
        slotIso: analysis.slotIso,
        confidence: analysis.confidence,
        rejectionDetected: analysis.rejectionDetected,
        hasSummary: !!analysis.summary,
      });

      // Persist analysis results on call record
      await ctx.runMutation(internal.call.calls.updateBookingAnalysis, {
        callId,
        bookingAnalysis: {
          meetingBooked: analysis.meetingBooked,
          slotIso: analysis.slotIso,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          rejectionDetected: analysis.rejectionDetected,
        },
      });

      // Save summary generated by our own AI if provided
      if (analysis.summary) {
        await ctx.runMutation(internal.call.calls.saveCallSummary, {
          callId,
          summary: analysis.summary,
        });
      }

      // Handle rejection detection
      if (analysis.rejectionDetected) {
        console.log(`[AI Analysis] Rejection detected, updating opportunity status`);
        await ctx.runMutation(internal.leadGen.audit.updateOpportunityStatus, {
          opportunityId: call.opportunityId,
          status: "Rejected",
        });
      }

      // Handle meeting booking
      if (analysis.meetingBooked && analysis.slotIso) {
        console.log(`[AI Analysis] Meeting booking detected for slot: ${analysis.slotIso}`);
        await ctx.runMutation(internal.call.meetings.finalizeBooking, {
          callId,
          isoTimestamp: analysis.slotIso,
        });
      }

    } catch (error) {
      console.error(`[AI Analysis] Error processing transcript:`, error);
      
      // Persist error state
      await ctx.runMutation(internal.call.calls.updateBookingAnalysis, {
        callId,
        bookingAnalysis: {
          meetingBooked: false,
          slotIso: undefined,
          confidence: 0,
          reasoning: `Analysis failed: ${error}`,
          rejectionDetected: false,
        },
      });
    }

    return null;
  },
});
