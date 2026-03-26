import { Agent } from "@convex-dev/agent";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { components } from "./_generated/api";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// smart agent
export const casperAgent: any = new Agent(components.agent, {
  name: "casper-agent",
  languageModel: openrouter("openai/gpt-oss-120b:free") as any,
  instructions: "You are a helpful assistant."
})

// fast agent
export const casperAgentFast: any = new Agent(components.agent, {
  name: "casper-agent-fast",
  languageModel: openrouter("z-ai/glm-4.5-air:free") as any,
  instructions: "You are a helpful assistant."
})