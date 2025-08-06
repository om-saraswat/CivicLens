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
You are an AI that helps citizens report civic issues to the correct Indian government departments.

Given the issue and its location, generate a valid JSON object with the following fields only:

{
  "department": "Responsible department name",
  "email": "Official department email",
  "address": "Resolved location for filing complaint",
  "subject": "Subject line for the email complaint",
  "body": "Full complaint email body to be sent to the department with details of sender"
}

Rules:
- Use formal and respectful tone in the email body.
- Department must be accurate (like MCD, NHAI, PWD, etc.).
- Email must be valid (gov.in, nic.in, etc.).
- At the end of the body, include user's full name and email address as signature.
- DO NOT add explanations, markdown, or anything outside the JSON.

Complaint Details:
- Location: "${address}"
- Issue: "${issueDescription}"
- User Name: "${userName}"
- User Email: "${userEmail}"
`;

    const result = await model.generateContent(prompt);
    let jsonText = result.response.text().trim();

    // Remove code block formatting if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```/, "").replace(/```$/, "").trim();
    }

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
