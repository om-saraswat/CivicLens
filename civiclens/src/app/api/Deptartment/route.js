import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const body = await req.json();
    const { lat, lon, issueDescription } = body;

    if (!lat || !lon || !issueDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const locationIQKey = process.env.LOCATIONIQ_API_KEY;
    const geoUrl = `https://us1.locationiq.com/v1/reverse?key=${locationIQKey}&lat=${lat}&lon=${lon}&format=json`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    
    // The address now includes city, state, and pincode, which is crucial for nationwide routing
    const address = geoData.display_name || `Lat: ${lat}, Lon: ${lon}`;

    // ✨ CHANGED: New prompt designed for nationwide routing
    const prompt = `
You are an expert AI assistant for routing public complaints anywhere in India. Your task is to identify the correct, most current government department based on the provided location and issue.

**CRITICAL INSTRUCTION:** Government bodies in India are often restructured. You MUST prioritize the most current administrative information. For example, the municipal corporations in Delhi were reunified into a single 'Municipal Corporation of Delhi (MCD)' in 2022. Your answer must reflect the current, post-reunification reality, not historical data.

**Analysis Steps:**
1.  From the full address provided, identify the city, state, and the specific **current** local municipal body (e.g., Municipal Corporation, Municipality).
2.  Also, identify the corresponding state-level authority for major infrastructure (usually the Public Works Department of that state).

**Routing Rules:**
-   **Minor Issue:** If the issue is minor or very local (e.g., 'small pothole', 'garbage collection', 'streetlight'), the responsible department is the **local municipal body** you identified.
-   **Major Issue:** If the issue is major or affects main infrastructure (e.g., 'highway damage', 'large road collapse', 'flyover issue'), the responsible department is the **state-level authority**.

**Input Data:**
-   Location: "${address}"
-   Issue: "${issueDescription}"

**Output Instructions:**
-   Based on your analysis and the routing rules, determine the single most appropriate department, ensuring the department name is up-to-date.
-   For the 'department' value, use the full, official, and current name (e.g., "North Delhi Municipal Corporation (NDMC)").
-   For the 'email' value, provide a known, official, general complaint email for that current department. Do not use emails from defunct or historical entities and donot give website give proper Gmail account .
-   Respond ONLY in a valid JSON object with "department" and "email" keys.
`;

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Error parsing AI response:", responseText, e);
      // Fallback is now more generic
      parsed = {
        department: "Local Municipal Body",
        email: "contact@india.gov.in", // A generic national portal email
        note: "Fallback used. Please verify the correct local department.",
      };
    }

    parsed.address = address;

    return NextResponse.json(parsed);

  } catch (err) {
    console.error("❌ Fatal Error in /api/department:", err);
    return NextResponse.json({ error: "An unexpected server error occurred." }, { status: 500 });
  }
}