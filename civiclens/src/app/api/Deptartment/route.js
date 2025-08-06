import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust path if needed

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userName = session.user.name;
    const userEmail = session.user.email;

    const body = await req.json();
    const { lat, lon, issueDescription } = body;

    if (!lat || !lon || !issueDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const LOCATIONIQ_API_KEY = process.env.LOCATIONIQ_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!LOCATIONIQ_API_KEY || !GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing required API keys" },
        { status: 500 }
      );
    }

    // Reverse geocoding
    const geoRes = await fetch(
      `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json`
    );

    if (!geoRes.ok) {
      throw new Error(`LocationIQ failed with status ${geoRes.status}`);
    }

    const geoData = await geoRes.json();
    const address = geoData.display_name || `Lat: ${lat}, Lon: ${lon}`;

    // Ask Gemini
    const genai = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 512,
        responseMimeType: "application/json",
      },
    });
const prompt = `
You are an API that generates a formal civic complaint JSON to be emailed to the correct Indian government department.

Respond ONLY with a **valid JSON object**, and nothing else — no explanation, no formatting, no markdown.

Use this format:

{
  "department": "e.g., MCD, NHAI, PWD, etc.",
  "email": "official email (must end in .gov.in or .nic.in)",
  "address": "location string",
  "subject": "formal email subject",
  "body" :  "Write a formal complaint letter in full sentences, addressed to the MCD. Start with "Dear MCD," and explain the problem of illegal garbage dumping in a specific location. Describe the issue clearly like an application. Then provide the full address and include the GPS coordinates in this format: ${lat}, ${lon}. End the complaint with a polite request for action, followed by a self-introduction. On a new line, write the user's full name and email address. Do not include any date, subject line, or urgency section. Make it feel like a formal application, not like a Gmail or email. provide coordinates in different line with proper name ",  
  "lat": "${lat}",
  "lon": "${lon}"
}

Rules:
- Only valid JSON. No \`\`\`json or extra notes.
- Wrap all keys and values in double quotes.
- No markdown. No bullet points. No text before or after the object.
- Make sure JSON is directly parsable with JSON.parse()

Details:
- Location: ${address}
- Issue: ${issueDescription}
- User: ${userName}
- Email: ${userEmail}
`;


    const result = await model.generateContent(prompt);
let jsonText = result.response.text().trim();

console.log("🧠 Gemini Response:\n", jsonText); // 👈 Add this log

// Remove code block formatting
if (jsonText.startsWith("```json")) {
  jsonText = jsonText.replace(/^```json/, "").replace(/```$/, "").trim();
} else if (jsonText.startsWith("```")) {
  jsonText = jsonText.replace(/^```/, "").replace(/```$/, "").trim();
}

console.log("🧾 Cleaned JSON Text:\n", jsonText); // 👈 Add this too


    // Parse the JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
      
    } catch (e) {
      console.error("⚠️ AI response not valid JSON:", jsonText);
      parsed = {
        department: "Unknown Department",
        email: "N/A",
        address,
        subject: "Complaint Regarding Public Issue",
        body: `There is a civic issue reported at: ${address}\n\nIssue: ${issueDescription}\n\nReported by: ${userName} (${userEmail})\n\nPlease take necessary action.`,
        raw: jsonText,
      };
    }

    // Ensure address is attached
    parsed.address = address;
    console.log(parsed);
    return NextResponse.json(parsed);

  } catch (err) {
    console.error("❌ Fatal Error in /api/dept:", err);
    return NextResponse.json(
      {
        error: "An unexpected server error occurred.",
        details: err.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
