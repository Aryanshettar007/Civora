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
    const department = searchParams.get("dept");

    if (!department) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 });
    }

    await connectDB();

    const issues = await Issue.find({ department })
      .populate("reportedBy", "displayName email photoURL")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: issues });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
