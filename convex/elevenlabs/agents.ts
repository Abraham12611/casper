"use node";

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";

// ---------------------------------------------------------------------------
// System prompt builder
// ---------------------------------------------------------------------------

/**
 * Renders the ElevenLabs agent system prompt from the agency profile.
 * Uses {{variable_name}} syntax for values injected at call-time via
 * ElevenLabs dynamic_variables.
 */
function buildSystemPrompt(agency: Doc<"agency_profile">): string {
  const guardrails = (agency.guardrails ?? [])
    .map((g) => `- ${g}`)
    .join("\n") || "- Follow standard professional conduct";

  const approvedClaims = (agency.approvedClaims ?? [])
    .map((c) => `- ${c.text}`)
    .join("\n") || "- No specific claims provided";

  const qualificationCriteria = (agency.leadQualificationCriteria ?? [])
    .map((q) => `- ${q}`)
    .join("\n") || "- Standard business qualification";

  return `# Identity & Purpose
You are a professional, friendly business development representative for "{{agency_name}}". You sound completely human — never robotic or scripted. Your goal is to have a natural conversation and, if there is mutual interest, schedule a future 15-minute discovery call.

You are calling {{caller_name}} at {{company_name}}.

# About {{agency_name}}
{{agency_summary}}

## Core Offer
{{agency_core_offer}}

## Territory
${agency.targetGeography ?? "their area"} | Target vertical: ${agency.targetVertical ?? "all businesses"}

# Tone & Personality
${agency.tone ?? "Warm, professional, genuinely helpful, and consultative"}
- Speak naturally with contractions, like a real person would
- Show genuine interest in their business  
- Be confident but not pushy
- Never sound like you're reading from a script
- Keep it concise — no long tangents

# Your Guardrails
${guardrails}

# Approved Talking Points (use at most ONE per call)
${approvedClaims}

# Lead Qualification Criteria
${qualificationCriteria}

# Available Meeting Times
The prospect's timezone is ${agency.timeZone ?? "America/New_York"}.
Current available slots: {{available_slots}}

CRITICAL: ONLY offer times from {{available_slots}}. Never invent or guess times.

# Meeting Booking Rules
- When the prospect agrees to a time, confirm it clearly and say you'll follow up
- If they have email on file, say "I'll send a calendar invite"
- If no times work, politely end and suggest they reach out later
- Think to yourself [BOOK_SLOT: <ISO_timestamp>] when a slot is confirmed — never say this out loud

# Conversation Flow

## 1) Opening
"Hi there, this is [your name] with {{agency_name}}. Do you have just a quick minute?"

Wait for their response. If they're busy, offer to call back.

## 2) Build Interest
"The reason I'm reaching out is we specialize in {{agency_core_offer}}, and I noticed {{fit_reason}}. I thought there might be a good fit here."

Share ONE approved talking point if relevant.
"Would it make sense to schedule a quick 15-minute call this week?"

## 3) Handle Objections Naturally
- Interested → Move to scheduling
- Hesitant → One brief follow-up question, then pivot to scheduling
- Not interested → Thank them politely and end the call

## 4) Schedule
"Great! I have a couple of openings. {{available_slots_short}} — would either of those work?"

## 5) Confirm & Close
"Perfect! So we're set for [day, date, time, timezone]. Looking forward to it!"

## 6) Wrap Up
"Excellent! Have a great rest of your day!"

# Unresponsive Protocol
If no response after speaking twice: "I seem to have lost you there. I'll let you go — feel free to reach out if you'd like to chat. Take care!"

# Voicemail Script
"Hi, this is [name] from {{agency_name}}. I noticed {{fit_reason}} with your business and thought we might be able to help. I'd love to schedule a quick 15-minute call. Give me a call back. Thanks!"`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getElevenLabsClient() {
  const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");
  return new ElevenLabsClient({ apiKey });
}

function getAgentTools(agencyId: string) {
  const convexSiteUrl = process.env.CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    console.warn("CONVEX_SITE_URL is not set");
  }

  return [
    {
      type: "system" as const,
      name: "end_call",
      description:
        "End the call when the user says goodbye, indicates they are not interested, or all questions have been answered.",
      params: {
        systemToolType: "end_call" as const,
      },
    },
    {
      type: "webhook" as const,
      name: "check_availability",
      description:
        "Checks available meeting times. Call this whenever the customer asks about availability, when we are free, or wants to schedule a discovery call.",
      apiSchema: {
        url: `${convexSiteUrl || ""}/api/elevenlabs-tools/check-availability?agencyId=${agencyId}`,
        method: "POST" as const,
        requestBodySchema: {
          type: "object" as const,
          properties: {},
        },
      },
    },
    {
      type: "webhook" as const,
      name: "book_meeting",
      description:
        "Books a meeting for a specific date and time slot. You must ask and confirm the slot with the user first, then pass the chosen slot's ISO timestamp (e.g. 2026-05-26T14:30:00.000Z) to this tool.",
      apiSchema: {
        url: `${convexSiteUrl || ""}/api/elevenlabs-tools/book-meeting`,
        method: "POST" as const,
        requestHeaders: {
          "x-conversation-id": "{{system__conversation_id}}",
        },
        requestBodySchema: {
          type: "object" as const,
          properties: {
            slot_iso: {
              type: "string" as const,
              description: "The exact ISO timestamp of the chosen slot to book (e.g., '2026-05-28T10:00:00.000Z')",
            },
          },
          required: ["slot_iso"],
        },
      },
    },
  ] as any;
}


// ---------------------------------------------------------------------------
// provisionAgentForTenant
// ---------------------------------------------------------------------------

export const provisionAgentForTenant = internalAction({
  args: {
    agencyId: v.id("agency_profile"),
  },
  returns: v.null(),
  handler: async (ctx, { agencyId }) => {
    console.log(`[EL Agents] Provisioning agent for agency ${agencyId}`);

    // Load agency profile
    const agency = await ctx.runQuery(
      internal.leadGen.queries.getAgencyProfileInternal,
      { agencyId }
    );
    if (!agency) throw new Error(`Agency ${agencyId} not found`);

    const elevenlabs = getElevenLabsClient();

    try {
      // Mark as pending
      await ctx.runMutation(internal.elevenlabs.agentMutations.setAgentStatus, {
        agencyId,
        status: "pending",
      });

      const systemPrompt = buildSystemPrompt(agency);
      let agentId = process.env.ELEVENLABS_DEFAULT_AGENT_ID || "agent_1501ksj0r4fkfkrb5zk74mbmdggb";
      let isDefaultAgent = false;

      // If agency doesn't already have an agent ID, try to create one
      if (!agency.elevenlabsAgentId) {
        try {
          console.log(`[EL Agents] Attempting to create a new agent for agency ${agencyId}...`);
          const agent = await elevenlabs.conversationalAi.agents.create({
            name: `Casper — ${agency.companyName}`,
            tags: ["casper", "production"],
            conversationConfig: {
              tts: {
                voiceId: "JBFqnCBsd6RMkjVDRZzb", // Default: George (can be changed per-agency later)
                modelId: "eleven_flash_v2",
              },
              agent: {
                firstMessage: `Hi there, this is Casper calling on behalf of ${agency.companyName}. Do you have just a quick minute?`,
                prompt: {
                  prompt: systemPrompt,
                  llm: "gpt-4o-mini",
                  temperature: 0.5,
                  maxTokens: 300,
                  tools: getAgentTools(agencyId),
                },
              },
            },
          });
          agentId = agent.agentId;
          console.log(`[EL Agents] Agent created dynamically: ${agentId}`);
        } catch (createErr) {
          console.warn(
            `[EL Agents] Failed to create dynamic agent (possibly hit free-tier limit). ` +
            `Falling back to pre-created agent ID: ${agentId}`,
            createErr
          );
          isDefaultAgent = true;
        }
      } else {
        agentId = agency.elevenlabsAgentId;
        if (agentId === "agent_1501ksj0r4fkfkrb5zk74mbmdggb" || agentId === process.env.ELEVENLABS_DEFAULT_AGENT_ID) {
          isDefaultAgent = true;
        }
      }

      console.log(`[EL Agents] Using agent ${agentId} for agency ${agencyId}`);

      // Upload knowledge base document — agency summary + claims as text
      const kbText = [
        `# ${agency.companyName} — Agent Knowledge Base`,
        ``,
        `## Summary`,
        agency.summary ?? "No summary available.",
        ``,
        `## Core Offer`,
        agency.coreOffer ?? "Not specified.",
        ``,
        `## Approved Claims`,
        ...(agency.approvedClaims ?? []).map((c: any) => `- ${c.text} (source: ${c.source_url})`),
        ``,
        `## Lead Qualification Criteria`,
        ...(agency.leadQualificationCriteria ?? []).map((q: any) => `- ${q}`),
        ``,
        `## Guardrails`,
        ...(agency.guardrails ?? []).map((g: any) => `- ${g}`),
      ].join("\n");

      const kbDoc = await elevenlabs.conversationalAi.knowledgeBase.documents.createFromText({
        name: `${agency.companyName} — Profile`,
        text: kbText,
      });

      console.log(`[EL Agents] KB doc created: ${kbDoc.id}`);

      // Attach KB doc to the agent and update its prompt + tools configuration
      await elevenlabs.conversationalAi.agents.update(agentId, {
        name: `Casper — ${agency.companyName}`,
        conversationConfig: {
          tts: {
            voiceId: isDefaultAgent ? "cjVigY5qzO86Huf0OWal" : "JBFqnCBsd6RMkjVDRZzb",
            modelId: isDefaultAgent ? "eleven_v3_conversational" : "eleven_flash_v2_5",
          },
          agent: {
            firstMessage: `Hi there, this is Casper calling on behalf of ${agency.companyName}. Do you have just a quick minute?`,
            prompt: {
              prompt: systemPrompt,
              llm: isDefaultAgent ? "gemini-2.5-flash" : "gpt-4o-mini",
              knowledgeBase: [
                {
                  type: "text",
                  name: kbDoc.name,
                  id: kbDoc.id,
                },
              ],
              tools: getAgentTools(agencyId),
            },
          },
        },
      });

      // Save agent ID and KB IDs to DB
      await ctx.runMutation(internal.elevenlabs.agentMutations.saveAgentDetails, {
        agencyId,
        elevenlabsAgentId: agentId,
        elevenlabsKnowledgeBaseIds: [kbDoc.id],
        status: "ready",
      });

      console.log(`[EL Agents] Agent provisioned successfully for ${agency.companyName}`);
    } catch (error) {
      console.error(`[EL Agents] Provisioning failed for agency ${agencyId}:`, error);
      await ctx.runMutation(internal.elevenlabs.agentMutations.setAgentStatus, {
        agencyId,
        status: "error",
      });
      // Don't rethrow — agent provisioning failure shouldn't block onboarding
    }

    return null;
  },
});

// ---------------------------------------------------------------------------
// updateAgentForTenant
// ---------------------------------------------------------------------------

export const updateAgentForTenant = internalAction({
  args: {
    agencyId: v.id("agency_profile"),
  },
  returns: v.null(),
  handler: async (ctx, { agencyId }) => {
    console.log(`[EL Agents] Updating agent for agency ${agencyId}`);

    const agency = await ctx.runQuery(
      internal.leadGen.queries.getAgencyProfileInternal,
      { agencyId }
    );
    if (!agency) throw new Error(`Agency ${agencyId} not found`);
    if (!agency.elevenlabsAgentId) {
      console.warn(`[EL Agents] No agent ID for agency ${agencyId} — provisioning instead`);
      await ctx.runAction(internal.elevenlabs.agents.provisionAgentForTenant, { agencyId });
      return null;
    }

    const elevenlabs = getElevenLabsClient();

    try {
      const systemPrompt = buildSystemPrompt(agency);

      // Delete old KB docs and re-create
      const oldKbIds = agency.elevenlabsKnowledgeBaseIds ?? [];
      for (const docId of oldKbIds) {
        try {
          await elevenlabs.conversationalAi.knowledgeBase.documents.delete(docId);
        } catch {
          console.warn(`[EL Agents] Could not delete old KB doc ${docId}`);
        }
      }

      // Create fresh KB document
      const kbText = [
        `# ${agency.companyName} — Agent Knowledge Base`,
        ``,
        `## Summary`,
        agency.summary ?? "No summary available.",
        ``,
        `## Core Offer`,
        agency.coreOffer ?? "Not specified.",
        ``,
        `## Approved Claims`,
        ...(agency.approvedClaims ?? []).map((c: any) => `- ${c.text} (source: ${c.source_url})`),
        ``,
        `## Lead Qualification Criteria`,
        ...(agency.leadQualificationCriteria ?? []).map((q: any) => `- ${q}`),
        ``,
        `## Guardrails`,
        ...(agency.guardrails ?? []).map((g: any) => `- ${g}`),
      ].join("\n");

      const kbDoc = await elevenlabs.conversationalAi.knowledgeBase.documents.createFromText({
        name: `${agency.companyName} — Profile`,
        text: kbText,
      });

      // Update agent with new prompt + KB
      await elevenlabs.conversationalAi.agents.update(agency.elevenlabsAgentId, {
        name: `Casper — ${agency.companyName}`,
        conversationConfig: {
          agent: {
            firstMessage: `Hi there, this is Casper calling on behalf of ${agency.companyName}. Do you have just a quick minute?`,
            prompt: {
              prompt: systemPrompt,
              llm: "gpt-4o-mini",
              temperature: 0.5,
              maxTokens: 300,
              knowledgeBase: [
                {
                  type: "text",
                  name: kbDoc.name,
                  id: kbDoc.id,
                },
              ],
              tools: getAgentTools(agencyId),
            },
          },
        },
      });


      // Update KB IDs in DB
      await ctx.runMutation(internal.elevenlabs.agentMutations.saveAgentDetails, {
        agencyId,
        elevenlabsAgentId: agency.elevenlabsAgentId,
        elevenlabsKnowledgeBaseIds: [kbDoc.id],
        status: "ready",
      });

      console.log(`[EL Agents] Agent updated successfully for ${agency.companyName}`);
    } catch (error) {
      console.error(`[EL Agents] Update failed for agency ${agencyId}:`, error);
      await ctx.runMutation(internal.elevenlabs.agentMutations.setAgentStatus, {
        agencyId,
        status: "error",
      });
    }

    return null;
  },
});

// ---------------------------------------------------------------------------
// deleteAgentForTenant
// ---------------------------------------------------------------------------

export const deleteAgentForTenant = internalAction({
  args: {
    agencyId: v.id("agency_profile"),
    elevenlabsAgentId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { agencyId, elevenlabsAgentId }) => {
    console.log(`[EL Agents] Deleting agent ${elevenlabsAgentId} for agency ${agencyId}`);
    const elevenlabs = getElevenLabsClient();
    try {
      await elevenlabs.conversationalAi.agents.delete(elevenlabsAgentId);
      console.log(`[EL Agents] Agent ${elevenlabsAgentId} deleted`);
    } catch (error) {
      console.error(`[EL Agents] Failed to delete agent ${elevenlabsAgentId}:`, error);
    }
    return null;
  },
});
