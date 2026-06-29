import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Issue from "@/lib/db/models/issue.model";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const issue = await Issue.findByIdAndDelete(params.id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Issue deleted successfully" });
  } catch (error: any) {
    console.error("API DELETE /issues/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
