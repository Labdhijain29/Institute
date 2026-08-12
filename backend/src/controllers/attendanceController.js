import { Attendance } from "../models/Attendance.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const OFFICE_START_HOUR = Number(process.env.OFFICE_START_HOUR || 10);
const REQUIRED_WORKING_HOURS = Number(process.env.REQUIRED_WORKING_HOURS || 8);

const startOfDay = (value = new Date()) => { const date = new Date(value); date.setHours(0, 0, 0, 0); return date; };
const endOfDay = (value = new Date()) => { const date = new Date(value); date.setHours(23, 59, 59, 999); return date; };
const employeeType = (user) => user.role === "Faculty" ? "Faculty" : "Staff";
const canManage = (user) => ["Super Admin", "Admin", "HR", "Accountant"].includes(user.role);

function monthRange(month) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month || ""))) throw new ApiError(400, "Invalid month. Use YYYY-MM.");
  const [year, monthNumber] = month.split("-").map(Number);
  return { start: new Date(year, monthNumber - 1, 1), end: new Date(year, monthNumber, 0, 23, 59, 59, 999), workingDays: new Date(year, monthNumber, 0).getDate() };
}

export const scanAttendance = asyncHandler(async (req, res) => {
  if (["Student", "Parent"].includes(req.user.role)) throw new ApiError(403, "Employee access only");
  const now = new Date();
  const date = startOfDay(now);
  let attendance = await Attendance.findOne({ user: req.user._id, date });
  let created = false;

  if (!attendance) {
    const cutoff = new Date(now); cutoff.setHours(OFFICE_START_HOUR, 0, 0, 0);
    const status = now > cutoff ? "Late" : "Pending Logout";
    try {
      attendance = await Attendance.create({ user: req.user._id, date, type: employeeType(req.user), loginTime: now, status, markedBy: req.user._id, ipAddress: req.ip, deviceInfo: req.headers["user-agent"], remarks: "QR login recorded" });
      created = true;
    } catch (error) {
      if (error?.code !== 11000) throw error;
      attendance = await Attendance.findOne({ user: req.user._id, date });
    }
    if (created) return res.status(201).json({ action: "login", message: "Login marked successfully", attendance });
  }

  if (!attendance?.loginTime) throw new ApiError(400, "Attendance record is invalid");
  if (attendance.logoutTime) return res.json({ action: "completed", message: "Today's attendance is already completed.", attendance });
  attendance.logoutTime = now;
  attendance.totalWorkingMinutes = Math.max(Math.round((now - attendance.loginTime) / 60000), 0);
  attendance.totalHours = Number((attendance.totalWorkingMinutes / 60).toFixed(2));
  if (attendance.totalWorkingMinutes < REQUIRED_WORKING_HOURS * 30) attendance.status = "Half Day";
  else if (attendance.status !== "Late") attendance.status = "Present";
  attendance.remarks = "QR logout recorded";
  await attendance.save();
  res.json({ action: "logout", message: "Logout marked successfully", attendance });
});

export const todayAttendance = asyncHandler(async (req, res) => {
  const date = new Date();
  const attendance = await Attendance.findOne({ user: req.user._id, date: { $gte: startOfDay(date), $lte: endOfDay(date) } });
  res.json({ attendance, status: !attendance ? "Not Checked In" : attendance.logoutTime ? "Present / Completed" : "Present / Working" });
});

export const listEmployeeAttendance = asyncHandler(async (req, res) => {
  const targetUser = req.params.employeeId;
  if (!canManage(req.user) && String(req.user._id) !== targetUser) throw new ApiError(403, "You can only view your attendance");
  const items = await Attendance.find({ user: targetUser }).sort({ date: -1 }).populate("user", "name employeeId department designation");
  res.json({ items, total: items.length });
});

export const monthlyAttendanceSummary = asyncHandler(async (req, res) => {
  const targetUser = req.params.employeeId;
  if (!canManage(req.user) && String(req.user._id) !== targetUser) throw new ApiError(403, "You can only view your attendance");
  const employee = await User.findById(targetUser).select("employeeId");
  if (!employee) throw new ApiError(404, "Employee not found");
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const { start, end, workingDays } = monthRange(month);
  const rows = await Attendance.find({ user: targetUser, date: { $gte: start, $lte: end } });
  const count = (statuses) => rows.filter((row) => statuses.includes(row.status)).length;
  const presentDays = count(["Present", "Late", "Pending Logout"]);
  const paidLeave = count(["Leave"]);
  const halfDays = count(["Half Day"]);
  const absentDays = Math.max(workingDays - presentDays - paidLeave - halfDays, 0);
  res.json({ employeeId: employee.employeeId || String(employee._id), month, workingDays, presentDays, absentDays, paidLeave, unpaidLeave: 0, halfDays, lateDays: count(["Late"]), totalHours: Number((rows.reduce((total, row) => total + (row.totalWorkingMinutes || 0), 0) / 60).toFixed(2)), overtimeHours: 0 });
});
