import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Issue from "@/lib/db/models/issue.model";
import { getSession } from "@/lib/auth/session";
import { analyzeIssue } from "@/lib/ai/cora";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, imageUrl, location, address } = body;

    if (!title || !description || !imageUrl || !location || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Ask CORA (Gemini) to analyze the issue
    const aiAnalysis = await analyzeIssue(imageUrl, description);

    // If CORA determines it's not a civic issue, we can still save it but mark it as rejected
    // For now, we'll save it as Pending and store the AI response.
    const status = aiAnalysis.isCivicIssue ? "Pending" : "Rejected";

    await connectDB();

    // 2. Save the structured issue to MongoDB
    const issue = await Issue.create({
      title,
      description,
      category: aiAnalysis.category,
      severity: aiAnalysis.severity,
      status,
      location,
      address,
      imageUrl,
      department: aiAnalysis.department,
      reportedBy: session.userId,
      aiAnalysis: {
        isCivicIssue: aiAnalysis.isCivicIssue,
        confidenceScore: aiAnalysis.confidenceScore,
        reasoning: aiAnalysis.reasoning,
      }
    });

    return NextResponse.json({ success: true, data: issue });
  } catch (error: any) {
    console.error("API POST /issues error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
