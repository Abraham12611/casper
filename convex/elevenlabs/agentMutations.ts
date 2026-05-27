import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Save ElevenLabs agent details to the agency_profile record.
 */
export const saveAgentDetails = internalMutation({
  args: {
    agencyId: v.id("agency_profile"),
    elevenlabsAgentId: v.string(),
    elevenlabsKnowledgeBaseIds: v.array(v.string()),
    status: v.union(v.literal("pending"), v.literal("ready"), v.literal("error")),
  },
  returns: v.null(),
  handler: async (ctx, { agencyId, elevenlabsAgentId, elevenlabsKnowledgeBaseIds, status }) => {
    const agency = await ctx.db.get(agencyId);
    if (!agency) throw new Error(`Agency ${agencyId} not found`);
    await ctx.db.patch(agencyId, {
      elevenlabsAgentId,
      elevenlabsKnowledgeBaseIds,
      elevenlabsAgentStatus: status,
    });
    return null;
  },
});

/**
 * Set the ElevenLabs agent provisioning status only (e.g. "pending" or "error").
 */
export const setAgentStatus = internalMutation({
  args: {
    agencyId: v.id("agency_profile"),
    status: v.union(v.literal("pending"), v.literal("ready"), v.literal("error")),
  },
  returns: v.null(),
  handler: async (ctx, { agencyId, status }) => {
    const agency = await ctx.db.get(agencyId);
    if (!agency) throw new Error(`Agency ${agencyId} not found`);
    await ctx.db.patch(agencyId, { elevenlabsAgentStatus: status });
    return null;
  },
});

/**
 * Attach an ElevenLabs conversation ID to a call record after the outbound
 * call is initiated.
 */
export const attachElConversationId = internalMutation({
  args: {
    callId: v.id("calls"),
    elevenlabsConversationId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { callId, elevenlabsConversationId }) => {
    await ctx.db.patch(callId, {
      elevenlabsConversationId,
      provider: "elevenlabs",
    });
    return null;
  },
});

/**
 * Look up a call record by its ElevenLabs conversation ID.
 * Used by the webhook handler to correlate incoming events.
 */
export const getCallByElConversationId = internalMutation({
  args: {
    elevenlabsConversationId: v.string(),
  },
  returns: v.union(v.id("calls"), v.null()),
  handler: async (ctx, { elevenlabsConversationId }) => {
    const call = await ctx.db
      .query("calls")
      .withIndex("by_el_conversation_id", (q) =>
        q.eq("elevenlabsConversationId", elevenlabsConversationId)
      )
      .first();
    return call?._id ?? null;
  },
});

/**
 * Transition a Web Call to in-progress when initiated.
 */
export const transitionWebCallToInProgress = mutation({
  args: {
    callId: v.id("calls"),
  },
  returns: v.null(),
  handler: async (ctx, { callId }) => {
    const call = await ctx.db.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);
    await ctx.db.patch(callId, {
      currentStatus: "in-progress",
      startedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Append a transcript fragment during an active web call.
 */
export const appendWebCallTranscriptFragment = mutation({
  args: {
    callId: v.id("calls"),
    role: v.string(), // "user" or "assistant"
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { callId, role, text }) => {
    const call = await ctx.db.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    const existingTranscript = call.transcript ?? [];
    
    // Check if this text matches the last entry to prevent duplicate appends from browser rendering loops
    if (existingTranscript.length > 0) {
      const lastEntry = existingTranscript[existingTranscript.length - 1];
      if (lastEntry.role === role && lastEntry.text === text) {
        return null;
      }
    }

    const updatedTranscript = [
      ...existingTranscript,
      {
        role,
        text,
        timestamp: Date.now(),
        source: "web",
      },
    ];

    await ctx.db.patch(callId, {
      transcript: updatedTranscript,
    });
    return null;
  },
});

/**
 * Complete a web call and record the duration.
 */
export const completeWebCall = mutation({
  args: {
    callId: v.id("calls"),
    durationSeconds: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { callId, durationSeconds }) => {
    const call = await ctx.db.get(callId);
    if (!call) throw new Error(`Call ${callId} not found`);

    await ctx.db.patch(callId, {
      currentStatus: "completed",
      status: "completed",
      duration: durationSeconds * 1000,
      billingSeconds: durationSeconds,
    });
    return null;
  },
});
