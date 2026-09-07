// ============================================================
// SSE Streaming endpoint for AI Chat
// Streams OpenAI responses token-by-token via Server-Sent Events
// Now includes knowledge base context and submitted property data
// ============================================================

import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import {
  getAllProperties,
  getPropertyById,
  getAllMarketMetrics,
  getAllPriceHistory,
  getAllAiInsights,
  getSubmittedPropertyById,
} from "./db";
import { getKnowledgeBaseContext, searchKnowledge } from "./knowledgeBase";

/**
 * Build the system prompt with live database context + knowledge base.
 * When a submittedPropertyId is provided, fetch the submitted property data
 * for rich contextual answers about that specific property.
 */
async function buildSystemPrompt(
  propertyId: number | undefined,
  submittedPropertyId: number | undefined,
  userId: number,
  userQuery?: string
): Promise<string> {
  const [allProps, metrics, history, insights] = await Promise.all([
    getAllProperties(),
    getAllMarketMetrics(),
    getAllPriceHistory(),
    getAllAiInsights(),
  ]);

  // Fetch submitted property if provided (from the new property analysis flow)
  let submittedProperty: any = null;
  if (submittedPropertyId) {
    submittedProperty = await getSubmittedPropertyById(submittedPropertyId, userId);
  }

  // Fetch old-style property if provided (backward compatibility)
  let focusedProperty: any = null;
  if (propertyId && !submittedProperty) {
    focusedProperty = await getPropertyById(propertyId);
  }

  // Search knowledge base for relevant entries based on user query
  let relevantKnowledge = "";
  if (userQuery) {
    const results = searchKnowledge(userQuery, 3);
    if (results.length > 0) {
      relevantKnowledge = "\n\n## Relevant Knowledge Base Articles\n\n";
      for (const entry of results) {
        relevantKnowledge += `### ${entry.title}\n${entry.content}\n\n`;
      }
    }
  }

  const propertySummary = allProps
    .map(
      (p) =>
        `- ${p.address}: €${p.price.toLocaleString()}, ${p.beds} beds, ${p.baths} baths, ${p.sqft} m², AI Score: ${p.aiScore}/100, Type: ${p.type}, Status: ${p.status}`
    )
    .join("\n");

  const metricsSummary = metrics
    .map(
      (m) =>
        `- ${m.label}: ${m.value} (${Number(m.change) >= 0 ? "+" : ""}${m.change}% vs last month)`
    )
    .join("\n");

  const insightsSummary = insights
    .map(
      (i) =>
        `- ${i.title} (${i.type}, ${i.confidence}% confidence): ${i.description}`
    )
    .join("\n");

  const recentHistory = history.slice(-6);
  const historySummary = recentHistory
    .map((h) => `- ${h.month}: Median €${h.median.toLocaleString()}`)
    .join("\n");

  // Build focused context for the currently viewed property
  let focusedContext = "";

  if (submittedProperty) {
    // Rich context from submitted property (new flow)
    const priceHistory = submittedProperty.priceHistory
      ? JSON.parse(submittedProperty.priceHistory as string)
      : [];
    const priceHistoryStr = priceHistory.length > 0
      ? priceHistory.map((h: any) => `  - ${h.date}: €${h.price?.toLocaleString()}`).join("\n")
      : "  No price history available";

    focusedContext = `

## Currently Analyzed Property (from ${submittedProperty.sourcePlatform || "unknown"})
- **Title**: ${submittedProperty.title || "N/A"}
- **Address / Location**: ${submittedProperty.address || "N/A"}, ${submittedProperty.city || ""}, ${submittedProperty.district || ""}
- **Asking Price**: €${submittedProperty.askingPrice?.toLocaleString() || "N/A"}
- **Price per m²**: €${submittedProperty.pricePerSqm?.toLocaleString() || "N/A"}/m²
- **Bedrooms**: ${submittedProperty.bedrooms ?? "N/A"}, **Bathrooms**: ${submittedProperty.bathrooms ?? "N/A"}
- **Area**: ${submittedProperty.area ?? "N/A"} m²
- **Property Type**: ${submittedProperty.propertyType || "N/A"}
- **Year Built**: ${submittedProperty.yearBuilt || "N/A"}
- **Energy Rating**: ${submittedProperty.energyCertificate || "N/A"}
- **Days on Market**: ${submittedProperty.daysOnMarket ?? "N/A"}
- **Number of Price Reductions**: ${submittedProperty.priceReductions ?? 0}
- **Bargaining Power Score**: ${submittedProperty.bargainingPower ?? "N/A"}/100
- **Suggested Offer**: €${submittedProperty.suggestedOffer?.toLocaleString() || "N/A"}
- **Source URL**: ${submittedProperty.sourceUrl || "N/A"}

### Price History
${priceHistoryStr}

### AI Analysis
- **Description**: ${submittedProperty.aiDescription || "N/A"}
- **Pros**: ${submittedProperty.aiPros || "N/A"}
- **Cons**: ${submittedProperty.aiCons || "N/A"}
- **Neighborhood**: ${submittedProperty.aiNeighborhood || "N/A"}
- **Investment Analysis**: ${submittedProperty.aiInvestmentAnalysis || "N/A"}

When answering questions about this property, use ALL the data above to provide specific, data-driven answers. Reference the bargaining power score, price history, days on market, and comparable properties in the area.`;
  } else if (focusedProperty) {
    // Legacy property context
    focusedContext = `\n\n## Currently Viewed Property\n- Address: ${focusedProperty.address}\n- Price: €${focusedProperty.price.toLocaleString()}\n- Beds: ${focusedProperty.beds}, Baths: ${focusedProperty.baths}, Area: ${focusedProperty.sqft} m²\n- AI Score: ${focusedProperty.aiScore}/100\n- Type: ${focusedProperty.type}\n- Status: ${focusedProperty.status}\n- Commission Savings: €${focusedProperty.commissionSavings.toLocaleString()}\n- Description: ${focusedProperty.description}`;
  }

  // Get the full knowledge base for general context
  const knowledgeBaseContext = getKnowledgeBaseContext();

  return `You are a real estate assistant specializing in the Algarve region of Portugal. You work on behalf of the buyer, helping them get the best possible price when purchasing property. You help buyers analyze properties, understand market trends, evaluate risks, and make data-driven decisions.

You have access to the following live data from the platform:

## Portfolio Properties (${allProps.length} listings)
${propertySummary}

## Market Metrics
${metricsSummary}

## Price History (Last 6 Months)
${historySummary}

## AI Market Insights
${insightsSummary}${focusedContext}${relevantKnowledge}

${knowledgeBaseContext}

## Guidelines
- Always respond in a helpful, professional, and concise manner.
- Use specific data from the listings and market metrics when answering questions.
- When discussing prices, always use EUR (€) and areas in m².
- If a specific property is being analyzed, provide detailed, data-driven answers using ALL available property data (price history, bargaining power, comparable sales, AI analysis).
- When asked about taxes (IMT, stamp duty, IMI), use the knowledge base tables and calculate specific amounts based on the property price.
- When asked about the buying process, reference the step-by-step guide from the knowledge base.
- When asked about neighborhoods, provide detailed local insights from the knowledge base.
- Provide actionable advice — suggest when to make offers, flag potential risks, and highlight value opportunities.
- Keep responses focused and under 300 words unless the user asks for detailed analysis.
- If the user asks something outside real estate or the Algarve/Portugal market, politely redirect them.
- You can respond in Portuguese or English depending on the language the user writes in.
- Format responses with markdown for readability (headers, bold, bullet points, tables when useful).`;
}

/**
 * Express route handler: POST /api/ai/stream
 * Accepts JSON body: { messages, propertyId?, submittedPropertyId?, userId? }
 * Returns SSE stream of token chunks.
 */
export async function handleAiStream(req: Request, res: Response) {
  // This endpoint sits outside the tRPC middleware, so it authenticates the
  // session cookie itself. The caller's identity comes from that session and
  // never from the request body — otherwise anyone could read another user's
  // property analysis by guessing ids.
  let userId: number;
  try {
    const user = await sdk.authenticateRequest(req);
    userId = user.id;
  } catch {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const { messages, propertyId, submittedPropertyId } = req.body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    propertyId?: number;
    submittedPropertyId?: number;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY is not configured" });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.flushHeaders();

  try {
    // Get the last user message for knowledge base search
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content;

    const systemPrompt = await buildSystemPrompt(
      propertyId,
      submittedPropertyId,
      userId,
      lastUserMessage
    );

    const openaiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: openaiMessages,
          max_tokens: 1024,
          temperature: 0.7,
          stream: true,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("[AI Stream] OpenAI error:", openaiResponse.status, errorText);
      res.write(`data: ${JSON.stringify({ error: "OpenAI API error" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    const reader = openaiResponse.body?.getReader();
    if (!reader) {
      res.write(`data: ${JSON.stringify({ error: "No response body" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    // Handle client disconnect
    let clientDisconnected = false;
    req.on("close", () => {
      clientDisconnected = true;
      reader.cancel();
    });

    while (true) {
      if (clientDisconnected) break;

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE lines from the OpenAI stream
      const lines = buffer.split("\n");
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") {
          if (trimmed === "data: [DONE]") {
            res.write("data: [DONE]\n\n");
          }
          continue;
        }

        if (trimmed.startsWith("data: ")) {
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) {
              // Forward the content chunk to the client
              res.write(
                `data: ${JSON.stringify({ content: delta.content })}\n\n`
              );
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    }

    // Ensure we always send DONE
    if (!clientDisconnected) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (error) {
    console.error("[AI Stream] Error:", error);
    if (!res.writableEnded) {
      res.write(
        `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
      );
      res.write("data: [DONE]\n\n");
      res.end();
    }
  }
}
