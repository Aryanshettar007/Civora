import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Issue from "@/lib/db/models/issue.model";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch pending, verified, in-progress, resolved, or closed issues to display on the public explorer
    const issues = await Issue.find({
      status: { $in: ["Pending", "Verified", "In Progress", "Resolved", "Closed"] }
    })
      .select("title description status severity location address imageUrl aiAnalysis createdAt resolvedImageUrl resolvedAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: issues });
  } catch (error: any) {
    console.error("API GET /issues/map error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
