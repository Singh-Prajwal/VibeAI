
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
});

const sentimentTemplate = `Analyze the sentiment of the following text and respond with only one word: "positive", "negative", or "neutral".
Text: {text}`;

const sentimentPrompt = PromptTemplate.fromTemplate(sentimentTemplate);

const sentimentChain = new LLMChain({
  llm: model,
  prompt: sentimentPrompt,
});

async function analyzeSentiment(text: string) {
  try {
    const result = await sentimentChain.call({ text });
    return result.text.trim().toLowerCase();
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "unknown";
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, history } = await req.json();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // This line is no longer needed

    const chat = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    const sentiment = await analyzeSentiment(prompt);

    return NextResponse.json({ reply: text, sentiment });
  } catch (error: any) {
    console.error("Error in generate function:", error);
    return NextResponse.json(
      { error: "Failed to generate content", details: error.message },
      { status: 500 }
    );
  }
}
