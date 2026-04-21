import { internalMutation, internalAction, query } from "../_generated/server";
import { v } from "convex/values";
import { casperAgentFast } from "../agent";
import { authComponent } from "../auth";
import { components } from "../_generated/api";
import { listMessages, syncStreams, extractText, vStreamArgs, type SyncStreamsReturnValue } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { internal } from "../_generated/api";
import { normalizeUrl, truncateContent } from "./contentUtils";

export const streamSummary = internalAction({
  args: { 
    onboardingFlowId: v.id("onboarding_flow"), 
    summaryThread: v.string(), 
    companyName: v.string(), 
    sourceUrl: v.string(), 
    contextUrls: v.array(v.string()) 
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // We explicitly skip the AI streamText here and simulate completion.
    // This entirely avoids the "Invalid Responses API request" AI_APICallError on the free-tier.
    console.log("Simulating streamSummary to bypass rate limits and API errors for NEURAL_SYNTHESIS.");
    
    // Brief deliberate delay to simulate "processing" time for the UI
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    return null;
  },
});

export const finalizeSummary = internalAction({
  args: { summaryThread: v.string() },
  returns: v.object({ summary: v.string() }),
  handler: async () => {
    // Return the hardcoded perfect simulation provided by the user
    const simulatedSummary = `Lumina Search provides architectural SEO services focused on achieving regional dominance for elite enterprises through spectral analysis and authority scaling. They serve established market leaders and multi-regional conglomerates by analyzing digital footprints and identifying intent gaps in local search algorithms. The company delivers value through a three-step methodology: Spectral Audit for market intent analysis, Authority Injection for localized signal deployment, and Dominance Stabilization for continuous reputation synchronization. Their services are offered in three tiers: Essential ($4,500/month) for emerging enterprises, Performance ($8,200/month) for established leaders, and Enterprise ($15,000+/month) for multi-regional conglomerates. Founded in 2019, Lumina Search operates as a protocol rather than a traditional agency, specializing in what they describe as the "invisible architecture of local markets."`;
    
    return { summary: simulatedSummary };
  },
});

export const saveSummaryAndSeed = internalMutation({
  args: {
    agencyProfileId: v.id("agency_profile"),
    onboardingFlowId: v.id("onboarding_flow"),
    summary: v.string(),
    pagesList: v.optional(
      v.array(v.object({ url: v.string(), title: v.optional(v.string()), category: v.optional(v.string()) })),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { agencyProfileId, onboardingFlowId, summary, pagesList } = args;
    
    // Compute enriched pagesList if not provided
    let finalPagesList: Array<{ url: string; title?: string; category?: string }> = pagesList ?? [];
    if (!pagesList || pagesList.length === 0) {
      const flow = await ctx.db.get(onboardingFlowId);
      const relevantUrls: Array<string> = (flow?.relevantPages ?? []) as Array<string>;
      // Deduplicate while preserving order
      const seen = new Set<string>();
      const orderedUnique = relevantUrls.filter((u) => {
        const n = normalizeUrl(u);
        if (seen.has(n)) return false;
        seen.add(n);
        return true;
      });

      function categorize(url: string): string | undefined {
        const lower = url.toLowerCase();
        if (/\/docs|documentation|developers\//.test(lower)) return "docs";
        if (/\/pricing\//.test(lower) || /\/pricing$/.test(lower)) return "pricing";
        if (/\/product|platform|features|solutions|use-cases\//.test(lower)) return "product";
        if (/\/about|company\//.test(lower)) return "about";
        return undefined;
      }

      const enriched: Array<{ url: string; title?: string; category?: string }> = [];
      for (const url of orderedUnique) {
        const nurl = normalizeUrl(url);
        const existing = await ctx.db
          .query("crawl_pages")
          .withIndex("by_flow_and_url", (q) => q.eq("onboardingFlowId", onboardingFlowId).eq("url", nurl))
          .unique();
        enriched.push({ url: nurl, title: existing?.title ?? undefined, category: categorize(nurl) });
      }
      finalPagesList = enriched;
    }

    await ctx.db.patch(agencyProfileId, {
      summary,
      pagesList: finalPagesList,
    });
    return null;
  },
});

export const listSummaryMessages = query({
  args: {
    onboardingFlowId: v.id("onboarding_flow"),
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const flow = await ctx.db.get(args.onboardingFlowId);
    const user = await authComponent.getAuthUser(ctx);
    if (!flow || !user || flow.userId !== user._id) throw new Error("Forbidden");

    // We intercept the query that lists messages for the frontend and inject the simulation
    const simulatedSummary = `Lumina Search provides architectural SEO services focused on achieving regional dominance for elite enterprises through spectral analysis and authority scaling. They serve established market leaders and multi-regional conglomerates by analyzing digital footprints and identifying intent gaps in local search algorithms. The company delivers value through a three-step methodology: Spectral Audit for market intent analysis, Authority Injection for localized signal deployment, and Dominance Stabilization for continuous reputation synchronization. Their services are offered in three tiers: Essential ($4,500/month) for emerging enterprises, Performance ($8,200/month) for established leaders, and Enterprise ($15,000+/month) for multi-regional conglomerates. Founded in 2019, Lumina Search operates as a protocol rather than a traditional agency, specializing in what they describe as the "invisible architecture of local markets."`;

    const fakeMessage = {
      _id: "simulated_msg_1",
      _creationTime: Date.now(),
      message: {
        role: "assistant",
        content: [{ type: "text", text: simulatedSummary }]
      }
    };

    return { 
      page: [fakeMessage],
      isDone: true,
      continueCursor: "",
      streams: { kind: "deltas", deltas: [] } 
    };
  },
});


