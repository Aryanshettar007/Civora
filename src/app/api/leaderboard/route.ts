import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/user.model";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch top 10 citizens sorted by reputation
    const topCitizens = await User.find({ role: "citizen" })
      .select("displayName photoURL reputation createdAt")
      .sort({ reputation: -1, createdAt: 1 })
      .limit(10);

    // Fetch top 10 resolving authority users sorted by reputation
    const topAuthorities = await User.find({ role: "authority" })
      .select("displayName photoURL reputation department")
      .sort({ reputation: -1, createdAt: 1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      citizens: topCitizens,
      authorities: topAuthorities
    });
  } catch (error: any) {
    console.error("API GET /leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
