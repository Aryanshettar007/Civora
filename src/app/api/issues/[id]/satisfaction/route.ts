import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Issue from "@/lib/db/models/issue.model";
import { getSession } from "@/lib/auth/session";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { rating, feedback } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "A valid rating between 1 and 5 is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const issue = await Issue.findById(params.id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Only the reporting citizen can close/rate their issue
    if (issue.reportedBy.toString() !== session.userId) {
      return NextResponse.json(
        { error: "Only the citizen who reported this issue can rate it" },
        { status: 403 }
      );
    }

    if (issue.status !== "Resolved") {
      return NextResponse.json(
        { error: "Only resolved issues can be marked as satisfied" },
        { status: 400 }
      );
    }

    // Update Issue status to Closed and store feedback
    issue.status = "Closed";
    issue.citizenRating = rating;
    issue.citizenFeedback = feedback || "";
    await issue.save();

    // Reward the resolving authority with reputation points based on quality (rating * 2)
    if (issue.resolvedBy) {
      const User = (await import("@/lib/db/models/user.model")).default;
      await User.findByIdAndUpdate(issue.resolvedBy, {
        $inc: { reputation: rating * 2 }
      });
      console.log(`⭐ Awarded +${rating * 2} reputation to authority user ${issue.resolvedBy} for resolving issue.`);
    }

    return NextResponse.json({ success: true, data: issue });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
