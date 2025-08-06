// app/api/send-email/route.js
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "../../../lib/mongodb";
import Complaints from "../../../models/Complaints";
import Users from "../../../models/Users";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { to, subject, message, deptName, location, lat, lon } = await req.json();

    // Debug logs
    console.log('📧 Send Email API - Received data:', {
      to,
      subject,
      deptName,
      location,
      lat,
      lon,
      messageLength: message?.length || 0
    });

    // Connect to MongoDB
    await dbConnect();

    // Get or create user
    let user = await Users.findOne({ email: session.user.email });
    if (!user) {
      user = await Users.create({
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      });
    }

    // Generate unique complaint number
    const complaintNo = `CMP${Date.now()}`;

    // Save complaint with user reference
    const complaintData = {
      deptName: deptName || "Unknown Department",
      deptMail: to,
      subject,
      description: message,
      location: location || "",
      complaintNo,
      user: user._id,
      coordinates: {
        lat: lat || null,
        lon: lon || null
      }
    };

    console.log('💾 Saving complaint to database:', complaintData);

    const complaint = await Complaints.create(complaintData);
    console.log('✅ Complaint saved with ID:', complaint._id);

    // Send email via Gmail API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "",
      message,
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    console.log('📤 Email sent successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      complaintNo,
      savedDepartment: complaintData.deptName 
    }), { status: 200 });
    
  } catch (err) {
    console.error('❌ Send Email API Error:', err);
    return new Response(JSON.stringify({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }), { status: 500 });
  }}