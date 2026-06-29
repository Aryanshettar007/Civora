import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Issue from "@/lib/db/models/issue.model";
import { getSession } from "@/lib/auth/session";
import { verifyResolution } from "@/lib/ai/cora";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only authority or admin can resolve
    if (session.role !== "authority" && session.role !== "admin") {
      return NextResponse.json({ error: "Only authorities can resolve issues" }, { status: 403 });
    }

    const body = await request.json();
    const { resolvedImageUrl, status } = body;

    // Must provide a resolution image to mark as resolved
    if (status === "Resolved" && !resolvedImageUrl) {
      return NextResponse.json(
        { error: "A resolution image is required to mark an issue as resolved" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingIssue = await Issue.findById(params.id);
    if (!existingIssue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (status === "Resolved") {
      // Call CORA AI to compare the before/after images and verify
      const verification = await verifyResolution(
        existingIssue.imageUrl,
        resolvedImageUrl,
        existingIssue.description
      );

      updateData.resolvedImageUrl = resolvedImageUrl;
      updateData.resolvedBy = session.userId;
      updateData.resolvedAt = new Date();
      updateData["aiAnalysis.resolutionVerification"] = {
        isFixed: verification.isFixed,
        confidenceScore: verification.confidenceScore,
        reasoning: verification.reasoning,
      };

      if (verification.isFixed) {
        updateData.status = "Resolved";
        
        // Dynamically import User model to award points
        const User = (await import("@/lib/db/models/user.model")).default;
        await User.findByIdAndUpdate(existingIssue.reportedBy, {
          $inc: { reputation: 10 }
        });
      } else {
        updateData.status = "Verification Failed";
      }
    } else {
      updateData.status = status;
    }

    // Also allow "In Progress" status update
    if (status === "In Progress") {
      updateData.assignedTo = session.userId;
    }

    const issue = await Issue.findByIdAndUpdate(params.id, updateData, { new: true })
      .populate("reportedBy", "displayName email photoURL");

    return NextResponse.json({ success: true, data: issue });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
