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

    // Aggregate issue counts grouped by department and status
    const stats = await Issue.aggregate([
      {
        $group: {
          _id: { department: "$department", status: "$status" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format the stats for client consumption
    const departmentStats: Record<string, { Pending: number; "In Progress": number; Resolved: number; Total: number }> = {};

    stats.forEach((item) => {
      const { department, status } = item._id;
      if (!departmentStats[department]) {
        departmentStats[department] = { Pending: 0, "In Progress": 0, Resolved: 0, Total: 0 };
      }
      if (status === "Pending" || status === "In Progress" || status === "Resolved") {
        departmentStats[department][status as "Pending" | "In Progress" | "Resolved"] = item.count;
      }
      departmentStats[department].Total += item.count;
    });

    // Get overall system totals
    const overallCounts = await Issue.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const overall = { Pending: 0, "In Progress": 0, Resolved: 0, Total: 0 };
    overallCounts.forEach((item) => {
      if (item._id === "Pending" || item._id === "In Progress" || item._id === "Resolved") {
        overall[item._id as "Pending" | "In Progress" | "Resolved"] = item.count;
      }
      overall.Total += item.count;
    });

    return NextResponse.json({
      success: true,
      data: {
        overall,
        departments: departmentStats
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
