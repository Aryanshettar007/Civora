import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Issue from "@/lib/db/models/issue.model";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // 1. Issue distribution by Category
    const categoryStats = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // 2. Department loads and resolution statistics
    const departmentStats = await Issue.aggregate([
      {
        $group: {
          _id: "$department",
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ["$status", ["Resolved", "Closed"]] }, 1, 0]
            }
          },
          avgRating: { $avg: "$citizenRating" }
        }
      }
    ]);

    // 3. City Resolution Velocity (average days to resolve issues month-over-month)
    const velocityStats = await Issue.aggregate([
      { $match: { resolvedAt: { $exists: true, $ne: null } } },
      {
        $project: {
          month: { $dateToString: { format: "%b %Y", date: "$resolvedAt" } }, // E.g., "Jun 2026"
          resolveTimeDays: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60 * 24 // convert ms to days
            ]
          }
        }
      },
      {
        $group: {
          _id: "$month",
          avgDays: { $avg: "$resolveTimeDays" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Format results for Recharts
    const formattedCategories = categoryStats.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    const formattedDepartments = departmentStats.map((item) => ({
      name: item._id,
      total: item.total,
      resolved: item.resolved,
      avgRating: item.avgRating ? parseFloat(item.avgRating.toFixed(1)) : 0,
    }));

    const formattedVelocity = velocityStats.map((item) => ({
      month: item._id,
      days: parseFloat(item.avgDays.toFixed(1)),
      issues: item.count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        categories: formattedCategories,
        departments: formattedDepartments,
        velocity: formattedVelocity,
      },
    });
  } catch (error: any) {
    console.error("API GET /admin/analytics error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
