"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import FirecrawlApp from "@mendable/firecrawl-js";

/**
 * Internal action to source leads using Firecrawl Agent Research
 * Replaces previous Google Places API
 */
export const sourcePlaces = internalAction({
  args: {
    leadGenFlowId: v.id("lead_gen_flow"),
    textQuery: v.string(),
    maxResultCount: v.number(),
  },
  returns: v.object({
    places: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        website: v.optional(v.string()),
        phone: v.optional(v.string()),
        rating: v.optional(v.number()),
        reviews: v.optional(v.number()),
        address: v.optional(v.string()),
      })
    ),
    numFetched: v.number(),
  }),
  handler: async (ctx, args) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error("Firecrawl API key not configured. Missing FIRECRAWL_API_KEY env var.");
    }

    const firecrawl = new FirecrawlApp({ apiKey });

    // Ensure we don't ask for too many and blow through credits unexpectedly
    const requestCount = Math.min(args.maxResultCount, 20);
    console.log(`[Lead Gen] Sourcing ${requestCount} places using Firecrawl Agent for query: "${args.textQuery}"`);

    try {
      // Use the autonomous Agent to perform deep research
      const result = await firecrawl.agent({
        prompt: `Find ${requestCount} businesses matching: "${args.textQuery}". Focus on precise, real businesses. If you cannot find ${requestCount}, return as many real matches as you can find. Provide their exact name, website, phone number, physical address, and any rating/review counts if available.`,
        schema: {
          type: "object",
          properties: {
            places: {
              type: "array",
              description: "List of localized businesses discovered during research",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Unique identifier. E.g., the root domain name, place ID, or formatted unique name" },
                  name: { type: "string", description: "Full business name" },
                  website: { type: "string", description: "Business website URL, e.g. https://example.com" },
                  phone: { type: "string", description: "Contact phone number" },
                  rating: { type: "number", description: "Overall rating score if applicable" },
                  reviews: { type: "number", description: "Total number of reviews if applicable" },
                  address: { type: "string", description: "Full physical address of the business" }
                },
                required: ["name", "id"]
              }
            }
          },
          required: ["places"]
        },
        model: "spark-1-mini", // Cost-effective model for straightforward data extraction
      });

      if (!result.success) {
        throw new Error(result.error || "Agent search returned non-success without specific error.");
      }

      console.log(`[Lead Gen] Received data from Firecrawl Agent. Credits used: ${result.creditsUsed}`);

      const rawPlaces = (result.data as { places?: Array<any> })?.places || [];
      console.log(`[Lead Gen] Extracted ${rawPlaces.length} raw places from Agent response.`);

      // Transform and normalize the places data
      const places = rawPlaces.map((p) => {
        const name = p?.name ?? "";
        const website = p?.website ? normalizeWebsite(p.website) : undefined;
        const phone = p?.phone ? normalizePhone(p.phone) : undefined;
        
        return {
          id: p?.id ?? name.replace(/\s+/g, '-').toLowerCase(), // Fallback unique ID
          name,
          website,
          phone,
          rating: p?.rating ?? undefined,
          reviews: p?.reviews ?? undefined,
          address: p?.address ?? undefined,
        };
      });

      // Deduplication by canonical website domain & generated IDs
      const deduplicatedPlaces = deduplicatePlaces(places);
      
      console.log(`[Lead Gen] After deduplication: ${deduplicatedPlaces.length} unique places`);

      return {
        places: deduplicatedPlaces,
        numFetched: deduplicatedPlaces.length,
      };
    } catch (error) {
      console.error("[Lead Gen] Firecrawl Agent API error:", error);
      throw new Error(`Firecrawl Agent API failed: ${String(error)}`);
    }
  },
});

/**
 * Normalize website URL to a canonical format
 */
function normalizeWebsite(website: string): string | undefined {
  if (!website) return undefined;
  
  try {
    // Add protocol if missing
    let url = website.toLowerCase().trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // Remove www. prefix for consistency
    let hostname = urlObj.hostname;
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    // Return clean URL
    return `https://${hostname}${urlObj.pathname === '/' ? '' : urlObj.pathname}`;
  } catch {
    // If URL parsing fails, return original
    return website;
  }
}

/**
 * Normalize phone number (basic normalization)
 */
function normalizePhone(phone: string): string | undefined {
  if (!phone) return undefined;
  
  // Remove common formatting characters but keep the core number
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  return cleaned.length > 5 ? phone : undefined; // Return original format if valid
}

/**
 * Deduplicate places by Google ID and canonical website domain
 */
function deduplicatePlaces(places: Array<{
  id: string;
  name: string;
  website?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  address?: string;
}>) {
  const seenIds = new Set<string>();
  const seenDomains = new Set<string>();
  const deduplicated: Array<typeof places[number]> = [];

  for (const place of places) {
    const idKey = place.id || "";
    let domainKey: string | undefined;
    if (place.website) {
      try {
        domainKey = new URL(place.website).hostname.replace(/^www\./, "");
      } catch {
        domainKey = undefined;
      }
    }

    const isDuplicateById = idKey !== "" && seenIds.has(idKey);
    const isDuplicateByDomain = domainKey ? seenDomains.has(domainKey) : false;

    if (isDuplicateById || isDuplicateByDomain) {
      continue;
    }

    if (idKey !== "") seenIds.add(idKey);
    if (domainKey) seenDomains.add(domainKey);
    deduplicated.push(place);
  }

  return deduplicated;
}

