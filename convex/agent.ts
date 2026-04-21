import { Agent } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { components } from "./_generated/api";

// Use the dedicated OpenRouter provider — it is purpose-built for OpenRouter's
// Chat Completions API and never attempts the /responses endpoint that OpenRouter
// doesn't support. @ai-sdk/openai was not installed in node_modules (missing from
// the install), so all previous calls were failing at the provider resolution step.
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

console.log("[agent] OpenRouter key present:", !!process.env.OPENROUTER_API_KEY);

// Model: google/gemma-3-4b-it:free — higher free-tier RPM vs GLM/GPT-OSS
// Swap to "meta-llama/llama-3.2-3b-instruct:free" if Gemma is unavailable.
const MODEL = "google/gemma-3-4b-it:free";

// smart agent (kept for legacy call sites)
export const casperAgent: any = new Agent(components.agent, {
  name: "casper-agent",
  languageModel: openrouter(MODEL) as any,
  instructions: "You are a helpful assistant.",
});

// fast agent — used for all onboarding AI calls
export const casperAgentFast: any = new Agent(components.agent, {
  name: "casper-agent-fast",
  languageModel: openrouter(MODEL) as any,
  instructions: "You are a helpful assistant.",
});