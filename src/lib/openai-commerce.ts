import OpenAI from "openai";
import { analyzeCommerceQuestion } from "./commerce-ai";
import { getActiveProducts } from "./product-store";
import type { CommerceAIResponse } from "./types";

const SYSTEM_PROMPT =
  "You are TrendRadar AI, an ecommerce product research consultant. Use the provided structured intelligence as ground truth — don't invent data points that aren't in it. Keep recommendations practical and concise.";

async function callClaude(query: string, mockResponse: CommerceAIResponse): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: JSON.stringify({ userQuestion: query, structuredIntelligence: mockResponse })
          }
        ]
      })
    });

    if (!response.ok) return null;
    const payload = await response.json();
    const text = payload.content?.[0]?.text;
    return typeof text === "string" && text.trim() ? text : null;
  } catch {
    return null;
  }
}

async function callOpenAI(query: string, mockResponse: CommerceAIResponse): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const openai = new OpenAI({ apiKey: key });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({ userQuestion: query, structuredIntelligence: mockResponse })
        }
      ]
    });
    const text = completion.choices[0]?.message.content;
    return text && text.trim() ? text : null;
  } catch {
    return null;
  }
}

/**
 * TrendRadar's AI consultant layer. Tries Claude first (if ANTHROPIC_API_KEY
 * is set), then OpenAI (if OPENAI_API_KEY is set), and otherwise falls back
 * to the rules-based analyzeCommerceQuestion engine — so the app always
 * works without any LLM key, it just won't have natural-language commentary
 * layered on top of the real structured intelligence.
 */
export async function getCommerceAIResponse(query: string) {
  const products = await getActiveProducts();
  const mockResponse = analyzeCommerceQuestion(query, products);

  const claudeMessage = await callClaude(query, mockResponse);
  if (claudeMessage) {
    return { mode: "claude" as const, response: mockResponse, assistantMessage: claudeMessage };
  }

  const openAiMessage = await callOpenAI(query, mockResponse);
  if (openAiMessage) {
    return { mode: "openai" as const, response: mockResponse, assistantMessage: openAiMessage };
  }

  return { mode: "mock" as const, response: mockResponse };
}
