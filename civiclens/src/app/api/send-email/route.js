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

    let accessToken = session.accessToken;

    // ✅ Check and refresh token if expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: session.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const refreshData = await refreshRes.json();

      if (refreshData.access_token) {
        accessToken = refreshData.access_token;
        // Optionally update session or DB here
      } else {
        return new Response(JSON.stringify({ error: "Failed to refresh access token" }), { status: 401 });
      }
    }

    const { to, subject, message, deptName, location } = await req.json();

    // ✅ Connect to MongoDB
    await dbConnect();

    // ✅ Find or create user
    let user = await Users.findOne({ email: session.user.email });
    if (!user) {
      user = await Users.create({
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      });
    }

    // ✅ Create unique complaint number
    const complaintNo = `CMP${Date.now()}`;

    // ✅ Save complaint
    await Complaints.create({
      deptName,
      deptMail: to,
      subject,
      description: message,
      location,
      complaintNo,
      user: user._id,
    });

    // ✅ Prepare email
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      message,
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // ✅ Send email via Gmail API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      complaintNo
    }), { status: 200 });

  } catch (err) {
    console.error("Email send error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
