import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const body = await req.json();
    const { base64Image, mimeType } = body;

    if (!base64Image || !mimeType) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
      `**Describe in detail the issue shown in this image. Be specific about the type of public concern it represents (e.g., pothole, open drain, broken footpath, garbage dump, encroachment, waterlogging, etc.). Analyze the type of road and its surroundings (main road or colony, commercial or residential). Determine whether this falls under PWD or MCD jurisdiction. Finally, write a complaint/report template with issue, location, urgency, and department.**`,
    ]);

    return NextResponse.json({ description: result.response.text() });
  } catch (err) {
    console.error("❌ Error in /api/process-image:", err);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
