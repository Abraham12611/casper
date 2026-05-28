import { internalMutation, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

/**
 * Update the status of a call via ElevenLabs conversation ID.
 */
export const updateStatusFromWebhook = internalMutation({
  args: {
    elevenlabsConversationId: v.string(),
    status: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { elevenlabsConversationId, status }) => {
    const record = await ctx.db
      .query("calls")
      .withIndex("by_el_conversation_id", (q) =>
        q.eq("elevenlabsConversationId", elevenlabsConversationId)
      )
      .unique();
    if (!record) {
      console.warn(`[EL Webhook] Call record not found for conversation ID: ${elevenlabsConversationId}`);
      return null;
    }
    await ctx.db.patch(record._id, {
      status,
      currentStatus: status,
      lastWebhookAt: Date.now(),
    });
    return null;
  },
});

/**
 * Save the final post-call transcript and metrics from ElevenLabs webhook,
 * then schedule analysis and billing.
 */
export const finalizeReport = internalMutation({
  args: {
    elevenlabsConversationId: v.string(),
    summary: v.optional(v.string()),
    recordingUrl: v.optional(v.string()),
    endedReason: v.optional(v.string()),
    billingSeconds: v.optional(v.number()),
    transcript: v.array(
      v.object({
        role: v.string(),
        text: v.string(),
        timestamp: v.optional(v.number()),
        source: v.optional(v.string()),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("calls")
      .withIndex("by_el_conversation_id", (q) =>
        q.eq("elevenlabsConversationId", args.elevenlabsConversationId)
      )
      .unique();
    if (!record) {
      console.warn(`[EL Webhook] Call record not found for conversation ID: ${args.elevenlabsConversationId}`);
      return null;
    }

    const safeBillingSeconds =
      typeof args.billingSeconds === "number" && Number.isFinite(args.billingSeconds)
        ? Math.max(0, Math.round(args.billingSeconds))
        : undefined;

    await ctx.db.patch(record._id, {
      summary: args.summary,
      recordingUrl: args.recordingUrl,
      endedReason: args.endedReason,
      billingSeconds: safeBillingSeconds,
      status: "completed",
      currentStatus: "completed",
      transcript: args.transcript,
      lastWebhookAt: Date.now(),
    });

    console.log(`[EL Webhook] Call finalized for record ${record._id}`);

    // Schedule billing metering if duration is substantial
    if (typeof safeBillingSeconds === "number" && safeBillingSeconds > 0) {
      await ctx.scheduler.runAfter(0, internal.call.billing.meterAiCallUsage, {
        callId: record._id,
      });
    }

    // Schedule post-call analysis immediately
    try {
      console.log(`[EL Webhook] Scheduling immediate transcript analysis for call ${record._id}`);
      await ctx.scheduler.runAfter(0, internal.call.ai.processCallTranscript, {
        callId: record._id,
      });
    } catch (analysisError) {
      console.error("[EL Webhook] Failed to schedule transcript analysis:", analysisError);
    }

    return null;
  },
});
