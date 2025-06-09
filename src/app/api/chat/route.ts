// app/api/chat/route.ts
// (Your provided code is perfect here)

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// IMPORTANT: Set your Google API Key in a .env.local file
// NEXT_PUBLIC_GOOGLE_API_KEY="your_api_key_here"
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt, history } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Error in generate function:", error);
    return NextResponse.json(
      { error: "Failed to generate content", details: error.message },
      { status: 500 }
    );
  }
}
// // app/api/chat/route.ts

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { NextResponse } from "next/server";

// // IMPORTANT: Set your Google API Key in a .env.local file
// // NEXT_PUBLIC_GOOGLE_API_KEY="your_api_key_here"
// const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

// export async function POST(req: Request) {
//   try {
//     const { prompt, history } = await req.json();

//     if (!prompt) {
//       return NextResponse.json(
//         { error: "Prompt is required" },
//         { status: 400 }
//       );
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const chat = model.startChat({
//       history: history || [],
//       generationConfig: {
//         maxOutputTokens: 1000,
//       },
//     });

//     const result = await chat.sendMessage(prompt);
//     const response = await result.response;
//     const text = response.text();

//     return NextResponse.json({ reply: text });
//   } catch (error: any) {
//     console.error("Error in generate function:", error);
//     return NextResponse.json(
//       { error: "Failed to generate content", details: error.message },
//       { status: 500 }
//     );
//   }
// }
