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

// Model: moonshotai/kimi-k2.5 — paid reasoning-enabled LLM for high-accuracy analysis.
// Fallback to environment variable config if customized.
const MODEL = process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2.5";

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