import { Lead } from "../models/Lead.js";
import { Student } from "../models/Student.js";
import { Fee } from "../models/Fee.js";
import { User } from "../models/User.js";
import { Branch } from "../models/Branch.js";
import { Attendance } from "../models/Attendance.js";
import { Leave } from "../models/Leave.js";
import { LectureReport } from "../models/LectureReport.js";
import { Salary } from "../models/Salary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboardSummary = asyncHandler(async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const month = new Date().toISOString().slice(0, 7);
  const [totalBranches, totalUsers, totalEmployees, totalStudents, totalLeads, fees, todayAttendance, pendingLeaves, salarySummary, lectureReports] = await Promise.all([
    Branch.countDocuments(),
    User.countDocuments(),
    User.countDocuments({ role: { $nin: ["Student", "Parent"] }, isActive: true }),
    Student.countDocuments(),
    Lead.countDocuments(),
    Fee.aggregate([{ $group: { _id: null, revenue: { $sum: "$paidFees" }, pending: { $sum: "$pendingFees" } } }]),
    Attendance.find({ date: { $gte: today, $lt: tomorrow }, type: { $in: ["Staff", "Faculty"] } }),
    Leave.countDocuments({ status: "Pending" }),
    Salary.aggregate([{ $match: { month } }, { $group: { _id: null, payable: { $sum: "$netAmount" }, pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } } } }]),
    LectureReport.countDocuments({ date: { $gte: today, $lt: tomorrow } })
  ]);

  res.json({
    totalBranches,
    totalUsers,
    totalEmployees,
    totalStudents,
    totalLeads,
    totalRevenue: fees[0]?.revenue || 0,
    pendingFees: fees[0]?.pending || 0,
    presentEmployeesToday: todayAttendance.filter((row) => ["Present", "Late", "Pending Logout"].includes(row.status)).length,
    absentEmployeesToday: todayAttendance.filter((row) => row.status === "Absent").length,
    lateEmployeesToday: todayAttendance.filter((row) => row.status === "Late").length,
    pendingLogoutToday: todayAttendance.filter((row) => row.status === "Pending Logout").length,
    pendingLeaveRequests: pendingLeaves,
    salaryPayableThisMonth: salarySummary[0]?.payable || 0,
    pendingSalaryApprovals: salarySummary[0]?.pending || 0,
    lectureReportsToday: lectureReports
  });
});
