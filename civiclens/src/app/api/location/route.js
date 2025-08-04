export async function POST(req) {
  try {
    const body = await req.json();
    const { lat, lon } = body;

    if (!lat || !lon) {
      return Response.json({ error: "Latitude and longitude are required." }, { status: 400 });
    }

    const apiKey = process.env.LOCATIONIQ_API_KEY;
    const locationUrl = `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${lat}&lon=${lon}&format=json`;

    const res = await fetch(locationUrl);
    const data = await res.json();

    const address = data.display_name;

    // Use the address to generate an email (example stub)
    const emailBody = `Dear user,\n\nWe noticed you're near ${address}. Here's a custom message just for you!`;

    return Response.json({
      address,
      email: emailBody,
    });
  } catch (error) {
    console.error("Error in generate-email:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
