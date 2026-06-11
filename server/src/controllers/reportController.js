import { Lead } from "../models/Lead.js";
import { Student } from "../models/Student.js";
import { Fee } from "../models/Fee.js";
import { User } from "../models/User.js";
import { Branch } from "../models/Branch.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardSummary = asyncHandler(async (_req, res) => {
  const [totalBranches, totalUsers, totalStudents, totalLeads, fees] = await Promise.all([
    Branch.countDocuments(),
    User.countDocuments(),
    Student.countDocuments(),
    Lead.countDocuments(),
    Fee.aggregate([{ $group: { _id: null, revenue: { $sum: "$paidFees" }, pending: { $sum: "$pendingFees" } } }])
  ]);

  res.json({
    totalBranches,
    totalUsers,
    totalStudents,
    totalLeads,
    totalRevenue: fees[0]?.revenue || 0,
    pendingFees: fees[0]?.pending || 0
  });
});
