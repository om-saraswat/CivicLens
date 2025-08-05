import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const body = await req.json();
    const { lat, lon, issueDescription } = body;

    if (!lat || !lon || !issueDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Reverse Geocode
    const geoRes = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=${process.env.LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
    );
    const geoData = await geoRes.json();
    const address = geoData.display_name || `Lat: ${lat}, Lon: ${lon}`;

    // 2️⃣ Ask Gemini with strict JSON enforcement
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 512,
        responseMimeType: "application/json", // ✅ Forces JSON output
      },
    });

    const prompt = `
You are an AI that routes public complaints in India to the correct government department.

Analyze the complaint and output a **valid JSON object only** with these fields:
{
  "department": "Responsible department or authority name",
  "email": "Official email address",
  "address": "Resolved location for filing complaint"
}

Rules:
- Department must be official and accurate (Municipal Corporation, PWD, NHAI, Jal Board, Electricity Board, etc.).
- Email must be an official/public contact (gov.in, nic.in, or utility domain).
- DO NOT include any explanations, markdown, or text outside JSON.

Complaint:
- Location: "${address}"
- Issue: "${issueDescription}"
`;

    const result = await model.generateContent(prompt);
    const jsonText = result.response.text().trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.error("⚠️ AI response not valid JSON:", jsonText);
      parsed = {
        department: "Unknown Department",
        email: "N/A",
        address,
        raw: jsonText,
      };
    }

    parsed.address = address;
    return NextResponse.json(parsed);

  } catch (err) {
    console.error("❌ Fatal Error in /api/department:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
