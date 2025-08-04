import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const body = await req.json();
    const { lat, lon, issueDescription } = body;

    if (!lat || !lon || !issueDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1️⃣ Reverse Geocode using LocationIQ
    const locationIQKey = process.env.LOCATIONIQ_API_KEY;
    const geoUrl = `https://us1.locationiq.com/v1/reverse?key=${locationIQKey}&lat=${lat}&lon=${lon}&format=json`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    const address =
      geoData.display_name || `Lat: ${lat}, Lon: ${lon} (address not found)`;

    // 2️⃣ Generate response using Gemini
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a civic assistant AI for public complaint routing in India.

Location: ${address}
Issue: ${issueDescription}

Decide:
1. Which government department is responsible for this type of issue?
2. Provide an **official email address** for that department.
3. If the issue is minor/local (like small pothole, garbage, streetlight) -> mcd email.
4. If the issue is major/high severity (like flooding, large road damage, accident) → escalate to PWD or High Authority email.

Respond in this JSON format:
{
  "department": "...",
  "email": "..."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // 3️⃣ Parse AI response safely
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        address,
        department: "Unknown Department",
        email: "N/A",
        raw: text,
      };
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("❌ Error in /api/department:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
