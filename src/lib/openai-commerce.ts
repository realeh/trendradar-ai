import OpenAI from "openai";
import { analyzeCommerceQuestion } from "./commerce-ai";

export async function getCommerceAIResponse(query: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      mode: "mock" as const,
      response: analyzeCommerceQuestion(query)
    };
  }

  const openai = new OpenAI({ apiKey: key });
  const mockResponse = analyzeCommerceQuestion(query);

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          "You are TrendRadar AI, an ecommerce product research consultant. Use the provided structured mock intelligence as ground truth. Keep recommendations practical and concise."
      },
      {
        role: "user",
        content: JSON.stringify({
          userQuestion: query,
          structuredIntelligence: mockResponse
        })
      }
    ]
  });

  return {
    mode: "openai" as const,
    response: mockResponse,
    assistantMessage: completion.choices[0]?.message.content ?? mockResponse.summary
  };
}
