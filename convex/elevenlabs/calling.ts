"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

/**
 * Initiate an outbound call via ElevenLabs Conversational AI + Twilio.
 *
 * The agency must already have an ElevenLabs agent provisioned
 * (agency.elevenlabsAgentId must be set) before this can be called.
 */
export const startOutboundCall = internalAction({
  args: {
    callId: v.id("calls"),
    agencyId: v.id("agency_profile"),
    customerNumber: v.string(),      // E.164 format: +12345678900
    callerName: v.optional(v.string()),
    companyName: v.optional(v.string()),
    fitReason: v.optional(v.string()),
    availableSlots: v.optional(v.string()), // Pre-formatted slot string for dynamic var
    availableSlotsShort: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const fromNumberId = process.env.ELEVENLABS_TWILIO_PHONE_NUMBER_ID;

    if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");
    if (!fromNumberId) throw new Error("ELEVENLABS_TWILIO_PHONE_NUMBER_ID is not set");

    if (fromNumberId.startsWith("sk_") || fromNumberId.startsWith("SK")) {
      throw new Error(
        `Invalid ELEVENLABS_TWILIO_PHONE_NUMBER_ID value starting with "${fromNumberId.slice(0, 4)}". ` +
        `This environment variable must be set to your ElevenLabs Phone Number ID (which starts with 'PhN' and can be found under the 'Phone Numbers' tab in the ElevenLabs dashboard), ` +
        `NOT your Twilio Secret/API key starting with 'sk_' or 'SK'.`
      );
    }

    // Load agency to get the pre-provisioned agent ID
    let agency = await ctx.runQuery(
      internal.leadGen.queries.getAgencyProfileInternal,
      { agencyId: args.agencyId }
    );
    if (!agency) throw new Error(`Agency ${args.agencyId} not found`);
    
    if (!agency.elevenlabsAgentId) {
      console.log(`[EL Calling] Agency ${args.agencyId} does not have an ElevenLabs agent ID. Provisioning on-the-fly...`);
      // Provision the agent synchronously
      await ctx.runAction(internal.elevenlabs.agents.provisionAgentForTenant, {
        agencyId: args.agencyId,
      });

      // Reload agency profile
      agency = await ctx.runQuery(
        internal.leadGen.queries.getAgencyProfileInternal,
        { agencyId: args.agencyId }
      );
      
      if (!agency || !agency.elevenlabsAgentId) {
        throw new Error(
          `Agency ${args.agencyId} does not have an ElevenLabs agent provisioned and on-the-fly provisioning failed. ` +
          `Please check that ELEVENLABS_API_KEY is properly set in your Convex settings.`
        );
      }
    }

    console.log(
      `[EL Calling] Starting outbound call for agency ${agency.companyName} ` +
      `→ ${args.customerNumber} using agent ${agency.elevenlabsAgentId}`
    );

    // Build dynamic variables injected into the system prompt at call time
    const dynamicVariables: Record<string, string> = {
      agency_name: agency.companyName,
      agency_summary: agency.summary ?? agency.coreOffer ?? "a professional services company",
      agency_core_offer: agency.coreOffer ?? "services tailored to your business",
      caller_name: args.callerName ?? "there",
      company_name: args.companyName ?? "your company",
      fit_reason: args.fitReason ?? "some opportunities with your online presence",
      available_slots: args.availableSlots ?? "this week — I'll share specific times during our call",
      available_slots_short: args.availableSlotsShort ?? "this week",
    };

    // Call the ElevenLabs Twilio outbound call API
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agency.elevenlabsAgentId,
          agent_phone_number_id: fromNumberId,
          to_number: args.customerNumber,
          conversation_initiation_client_data: {
            dynamic_variables: dynamicVariables,
          },
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `ElevenLabs outbound call failed (${response.status}): ${text}`
      );
    }

    const data = (await response.json()) as { conversation_id?: string; callSid?: string };

    console.log(
      `[EL Calling] Call initiated. Conversation ID: ${data.conversation_id}, ` +
      `CallSid: ${data.callSid}`
    );

    // Attach EL conversation ID to the call record
    if (data.conversation_id) {
      await ctx.runMutation(
        internal.elevenlabs.agentMutations.attachElConversationId,
        {
          callId: args.callId,
          elevenlabsConversationId: data.conversation_id,
        }
      );
    }

    return null;
  },
});
