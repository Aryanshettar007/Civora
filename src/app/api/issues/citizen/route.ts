import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Issue from "@/lib/db/models/issue.model";
import { getSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "mine";

    await connectDB();

    // Ensure User model is registered in Mongoose for population
    const User = (await import("@/lib/db/models/user.model")).default;

    const query = filter === "all" ? {} : { reportedBy: session.userId };

    // Fetch issues and populate reporter details
    const issues = await Issue.find(query)
      .populate("reportedBy", "displayName email photoURL")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: issues });
  } catch (error: any) {
    console.error("API GET /issues/citizen error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
