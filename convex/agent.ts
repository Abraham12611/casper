import { Agent } from "@convex-dev/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { components } from "./_generated/api";

// Lazy references to avoid environment variable read-errors at module import time
let lazyCasperAgent: any = null;
let lazyCasperAgentFast: any = null;

function getCasperAgent() {
  if (!lazyCasperAgent) {
    const apiKey = process.env.OPENROUTER_API_KEY || "dummy-key-for-init";
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });
    const MODEL = process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2.5";
    
    console.log("[agent] Lazy initializing smart agent with model:", MODEL);
    lazyCasperAgent = new Agent(components.agent, {
      name: "casper-agent",
      languageModel: openrouter(MODEL) as any,
      instructions: "You are a helpful assistant.",
    });
  }
  return lazyCasperAgent;
}

function getCasperAgentFast() {
  if (!lazyCasperAgentFast) {
    const apiKey = process.env.OPENROUTER_API_KEY || "dummy-key-for-init";
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });
    const MODEL = process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2.5";
    
    console.log("[agent] Lazy initializing fast agent with model:", MODEL);
    lazyCasperAgentFast = new Agent(components.agent, {
      name: "casper-agent-fast",
      languageModel: openrouter(MODEL) as any,
      instructions: "You are a helpful assistant.",
    });
  }
  return lazyCasperAgentFast;
}

// Proxies to dynamically intercept calls and initialize agents lazily at run-time
export const casperAgent: any = new Proxy({} as any, {
  get(target, prop, receiver) {
    const agent = getCasperAgent();
    const value = Reflect.get(agent, prop);
    if (typeof value === "function") {
      return value.bind(agent);
    }
    return value;
  }
});

export const casperAgentFast: any = new Proxy({} as any, {
  get(target, prop, receiver) {
    const agent = getCasperAgentFast();
    const value = Reflect.get(agent, prop);
    if (typeof value === "function") {
      return value.bind(agent);
    }
    return value;
  }
});