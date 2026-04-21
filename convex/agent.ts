import { Agent } from "@convex-dev/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { components } from "./_generated/api";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  // CRITICAL: force Chat Completions API (/chat/completions).
  // AI SDK v5 defaults to the new OpenAI Responses API (/responses) for generateText,
  // but OpenRouter only supports Chat Completions. streamText worked (different endpoint)
  // which is why NEURAL_SYNTHESIS streamed fine but generateText calls crashed after.
  compatibility: "compatible",
});

// Primary model: google/gemma-3-4b-it:free — higher free-tier RPM limits
// Fallback option (update model string to switch): meta-llama/llama-3.2-3b-instruct:free
console.log("[agent] OpenRouter key present:", !!process.env.OPENROUTER_API_KEY);

// smart agent (alias kept for legacy; both agents now use the same reliable free model)
export const casperAgent: any = new Agent(components.agent, {
  name: "casper-agent",
  languageModel: openrouter("google/gemma-3-4b-it:free") as any,
  instructions: "You are a helpful assistant."
});

// fast agent — used for all onboarding AI calls
export const casperAgentFast: any = new Agent(components.agent, {
  name: "casper-agent-fast",
  languageModel: openrouter("google/gemma-3-4b-it:free") as any,
  instructions: "You are a helpful assistant."
});