import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "../../../lib/mongodb";
import Complaints from "../../../models/Complaints";
import Users from "../../../models/Users";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await dbConnect();

    // Find user
    const user = await Users.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get complaints for user with populated user reference
    const complaints = await Complaints.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return new Response(JSON.stringify({ 
      success: true, 
      complaints 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Complaints fetch error:', error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch complaints",
      details: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}