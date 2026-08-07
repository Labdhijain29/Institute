import { Attendance } from "../models/Attendance.js";
import { Leave } from "../models/Leave.js";
import { LectureReport } from "../models/LectureReport.js";
import { OfficeIP } from "../models/OfficeIP.js";
import { Salary } from "../models/Salary.js";
import { Staff } from "../models/Staff.js";
import { User } from "../models/User.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const OFFICE_START_HOUR = Number(process.env.OFFICE_START_HOUR || 10);
const REQUIRED_WORKING_HOURS = Number(process.env.REQUIRED_WORKING_HOURS || 8);
const ENFORCE_OFFICE_IP = String(process.env.ENFORCE_OFFICE_IP || "false").toLowerCase() === "true";

function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function monthRange(month) {
  const [year, monthIndex] = String(month || new Date().toISOString().slice(0, 7)).split("-").map(Number);
  const start = new Date(year, monthIndex - 1, 1);
  const end = new Date(year, monthIndex, 0, 23, 59, 59, 999);
  return { start, end, days: end.getDate() };
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket?.remoteAddress || req.ip || "";
}

function normalizeIp(ip) {
  return String(ip || "").replace("::ffff:", "");
}

async function requireOfficeIp(req) {
  const ip = normalizeIp(clientIp(req));
  const allowed = await OfficeIP.find({ isActive: true }).select("ipAddress");
  if (!ENFORCE_OFFICE_IP || !allowed.length || allowed.some((item) => normalizeIp(item.ipAddress) === ip)) return ip;
  throw new ApiError(403, "Login allowed only from office network.");
}

async function logActivity(req, action, module, metadata = {}) {
  await ActivityLog.create({
    user: req.user?._id,
    action,
    module,
    ipAddress: normalizeIp(clientIp(req)),
    deviceInfo: req.headers["user-agent"],
    metadata
  });
}

function ensureEmployee(req) {
  if (["Student", "Parent"].includes(req.user.role)) {
    throw new ApiError(403, "Employee access only");
  }
}

function canManageEmployees(req) {
  return ["Super Admin", "Admin", "HR"].includes(req.user.role);
}

export const employeeSummary = asyncHandler(async (req, res) => {
  const today = new Date();
  const todayFilter = { date: { $gte: startOfDay(today), $lte: endOfDay(today) }, type: { $in: ["Staff", "Faculty"] } };
  const month = req.query.month || today.toISOString().slice(0, 7);
  const { start, end } = monthRange(month);
  const [totalEmployees, todayRows, monthlyRows, leaveRequests, payrollRows, lectureReports] = await Promise.all([
    User.countDocuments({ role: { $nin: ["Student", "Parent"] }, isActive: true }),
    Attendance.find(todayFilter).populate("user", "name role department designation employeeId"),
    Attendance.find({ date: { $gte: start, $lte: end }, type: { $in: ["Staff", "Faculty"] } }),
    Leave.find({ status: "Pending" }).populate("user", "name role department").limit(20).sort({ createdAt: -1 }),
    Salary.find({ month }).populate("user", "name role department").sort({ createdAt: -1 }),
    LectureReport.find({ date: { $gte: start, $lte: end } }).populate("faculty", "name").sort({ date: -1 }).limit(20)
  ]);

  const statusCount = (status) => todayRows.filter((row) => row.status === status).length;
  const loginReport = todayRows.map((row) => ({
    id: row._id,
    employee: row.user?.name || "-",
    role: row.user?.role || "-",
    date: row.date,
    loginTime: row.loginTime,
    logoutTime: row.logoutTime,
    totalWorkingMinutes: row.totalWorkingMinutes || 0,
    status: row.status,
    ipAddress: row.ipAddress,
    deviceInfo: row.deviceInfo,
    remarks: row.remarks
  }));

  res.json({
    totalEmployees,
    today: {
      present: statusCount("Present") + statusCount("Pending Logout"),
      absent: statusCount("Absent"),
      late: statusCount("Late"),
      halfDay: statusCount("Half Day"),
      leave: statusCount("Leave"),
      pendingLogout: statusCount("Pending Logout")
    },
    monthlyAttendance: {
      totalRecords: monthlyRows.length,
      present: monthlyRows.filter((row) => ["Present", "Late", "Pending Logout"].includes(row.status)).length,
      absent: monthlyRows.filter((row) => row.status === "Absent").length,
      late: monthlyRows.filter((row) => row.status === "Late").length,
      halfDay: monthlyRows.filter((row) => row.status === "Half Day").length,
      leave: monthlyRows.filter((row) => row.status === "Leave").length
    },
    salarySummary: {
      payrollCount: payrollRows.length,
      payable: payrollRows.reduce((sum, row) => sum + (row.netAmount || 0), 0),
      pending: payrollRows.filter((row) => row.status === "Pending").length,
      approved: payrollRows.filter((row) => row.status === "Approved").length,
      paid: payrollRows.filter((row) => row.status === "Paid").length
    },
    leaveRequests,
    loginReport,
    lectureReports
  });
});

export const myEmployeeDashboard = asyncHandler(async (req, res) => {
  ensureEmployee(req);
  const today = new Date();
  const month = req.query.month || today.toISOString().slice(0, 7);
  const { start, end } = monthRange(month);
  const [staff, todayAttendance, monthlyAttendance, leaves, salary, lectures] = await Promise.all([
    Staff.findOne({ user: req.user._id }),
    Attendance.findOne({ user: req.user._id, date: { $gte: startOfDay(today), $lte: endOfDay(today) } }),
    Attendance.find({ user: req.user._id, date: { $gte: start, $lte: end } }).sort({ date: -1 }),
    Leave.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20),
    Salary.findOne({ user: req.user._id, month }),
    LectureReport.find({ faculty: req.user._id, date: { $gte: start, $lte: end } }).sort({ date: -1 })
  ]);

  res.json({
    employee: {
      id: req.user.employeeId || staff?.employeeCode || req.user._id,
      name: req.user.name,
      mobile: req.user.mobile || staff?.mobile,
      email: req.user.email || staff?.email,
      role: req.user.role,
      designation: req.user.designation || staff?.designation,
      department: req.user.department || staff?.department,
      joiningDate: req.user.dateOfJoining || staff?.joiningDate,
      monthlySalary: req.user.monthlySalary || staff?.monthlySalary || staff?.salary || 0
    },
    todayAttendance,
    monthlySummary: {
      total: monthlyAttendance.length,
      present: monthlyAttendance.filter((row) => ["Present", "Late", "Pending Logout"].includes(row.status)).length,
      late: monthlyAttendance.filter((row) => row.status === "Late").length,
      halfDay: monthlyAttendance.filter((row) => row.status === "Half Day").length,
      leave: monthlyAttendance.filter((row) => row.status === "Leave").length,
      absent: monthlyAttendance.filter((row) => row.status === "Absent").length
    },
    attendance: monthlyAttendance,
    leaves,
    salary,
    roleSummary: {
      lectureReports: lectures.length,
      role: req.user.role
    }
  });
});

export const employeeList = asyncHandler(async (_req, res) => {
  const [users, staffRows] = await Promise.all([
    User.find({ role: { $nin: ["Student", "Parent"] } }).select("-password").sort({ name: 1 }).lean(),
    Staff.find().lean()
  ]);
  const staffByUser = new Map(staffRows.filter((row) => row.user).map((row) => [String(row.user), row]));
  const items = users.map((user) => {
    const staff = staffByUser.get(String(user._id)) || {};
    return {
      _id: user._id,
      employeeId: user.employeeId || staff.employeeCode || "-",
      name: user.name || staff.fullName || "-",
      mobile: user.mobile || staff.mobile || "-",
      email: user.email || staff.email || "-",
      role: user.role || staff.role || "-",
      department: user.department || staff.department || "-",
      designation: user.designation || staff.designation || "-",
      joiningDate: user.dateOfJoining || staff.joiningDate,
      monthlySalary: user.monthlySalary || staff.monthlySalary || staff.salary || 0,
      status: user.isActive === false || staff.status === "Inactive" ? "Inactive" : "Active"
    };
  });
  res.json({ items, total: items.length });
});

export const payrollEmployeeOptions = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: { $nin: ["Student", "Parent"] }, isActive: true })
    .select("name role department designation employeeId dateOfJoining monthlySalary")
    .sort({ name: 1 })
    .lean();
  const staffRows = await Staff.find({ user: { $in: users.map((user) => user._id) } })
    .select("user employeeCode joiningDate department designation monthlySalary salary")
    .lean();
  const staffByUser = new Map(staffRows.map((staff) => [String(staff.user), staff]));
  const items = users.map((user) => {
    const staff = staffByUser.get(String(user._id));
    return {
      ...user,
      employeeCode: user.employeeId || staff?.employeeCode || "",
      department: user.department || staff?.department || "",
      designation: user.designation || staff?.designation || "",
      dateOfJoining: user.dateOfJoining || staff?.joiningDate || null,
      monthlySalary: Number(user.monthlySalary || staff?.monthlySalary || staff?.salary || 0)
    };
  });
  res.json({ items, total: items.length });
});

export const loginAttendance = asyncHandler(async (req, res) => {
  ensureEmployee(req);
  const ipAddress = await requireOfficeIp(req);
  const now = new Date();
  const existing = await Attendance.findOne({ user: req.user._id, date: { $gte: startOfDay(now), $lte: endOfDay(now) } });
  if (existing?.loginTime) throw new ApiError(409, "Attendance login already recorded for today");

  const lateCutoff = new Date(now);
  lateCutoff.setHours(OFFICE_START_HOUR, 0, 0, 0);
  const status = now > lateCutoff ? "Late" : "Pending Logout";
  const attendance = existing || new Attendance({ user: req.user._id, date: startOfDay(now), type: req.user.role === "Faculty" ? "Faculty" : "Staff", markedBy: req.user._id });
  attendance.loginTime = now;
  attendance.status = status;
  attendance.ipAddress = ipAddress;
  attendance.deviceInfo = req.headers["user-agent"];
  attendance.remarks = status === "Late" ? "Auto marked late by office login time" : "Office login recorded";
  await attendance.save();
  await logActivity(req, "attendance-login", "attendance", { attendance: attendance._id, status });
  res.status(201).json({ message: "Login attendance recorded", attendance });
});

export const logoutAttendance = asyncHandler(async (req, res) => {
  ensureEmployee(req);
  const now = new Date();
  const attendance = await Attendance.findOne({ user: req.user._id, date: { $gte: startOfDay(now), $lte: endOfDay(now) } });
  if (!attendance?.loginTime) throw new ApiError(404, "No login attendance found for today");
  if (attendance.logoutTime) throw new ApiError(409, "Logout already recorded for today");

  attendance.logoutTime = now;
  attendance.totalWorkingMinutes = Math.max(Math.round((now - attendance.loginTime) / 60000), 0);
  const requiredMinutes = REQUIRED_WORKING_HOURS * 60;
  if (attendance.totalWorkingMinutes < requiredMinutes / 2) attendance.status = "Half Day";
  else if (attendance.status !== "Late") attendance.status = "Present";
  attendance.remarks = attendance.status === "Half Day" ? "Auto marked half-day due to low working hours" : "Logout recorded";
  await attendance.save();
  await logActivity(req, "attendance-logout", "attendance", { attendance: attendance._id, totalWorkingMinutes: attendance.totalWorkingMinutes });
  res.json({ message: "Logout attendance recorded", attendance });
});

export const correctAttendance = asyncHandler(async (req, res) => {
  if (!["Super Admin", "Admin", "HR"].includes(req.user.role)) throw new ApiError(403, "Only Admin/HR can correct attendance");
  if (!req.body.correctionReason) throw new ApiError(400, "Correction reason is required");
  const attendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    { ...req.body, correctedBy: req.user._id, correctedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!attendance) throw new ApiError(404, "Attendance record not found");
  await logActivity(req, "attendance-correction", "attendance", { attendance: attendance._id, reason: req.body.correctionReason });
  res.json(attendance);
});

export const applyLeave = asyncHandler(async (req, res) => {
  ensureEmployee(req);
  const leave = await Leave.create({ ...req.body, user: req.user._id });
  await logActivity(req, "leave-apply", "leave", { leave: leave._id });
  res.status(201).json(leave);
});

export const reviewLeave = asyncHandler(async (req, res) => {
  if (!canManageEmployees(req)) throw new ApiError(403, "Only Admin/HR can review leave");
  const leave = await Leave.findByIdAndUpdate(req.params.id, { ...req.body, approvedBy: req.user._id, approvedAt: new Date() }, { new: true, runValidators: true });
  if (!leave) throw new ApiError(404, "Leave request not found");
  await logActivity(req, "leave-review", "leave", { leave: leave._id, status: leave.status });
  res.json(leave);
});

export const listLeaves = asyncHandler(async (req, res) => {
  ensureEmployee(req);
  const filter = canManageEmployees(req) ? {} : { user: req.user._id };
  const items = await Leave.find(filter).populate("user", "name role department designation").sort({ createdAt: -1 }).limit(100);
  res.json({ items, total: items.length });
});

export const listLectureReports = asyncHandler(async (req, res) => {
  ensureEmployee(req);
  const filter = canManageEmployees(req) ? {} : { faculty: req.user._id };
  const items = await LectureReport.find(filter).populate("faculty", "name role department designation").sort({ date: -1, createdAt: -1 }).limit(100);
  res.json({ items, total: items.length });
});

export const submitLectureReport = asyncHandler(async (req, res) => {
  if (!["Super Admin", "Admin", "Faculty"].includes(req.user.role)) throw new ApiError(403, "Only faculty can submit lecture reports");
  const report = await LectureReport.create({ ...req.body, faculty: req.body.faculty || req.user._id });
  await logActivity(req, "lecture-report-submit", "lecture", { lectureReport: report._id });
  res.status(201).json(report);
});

export const calculatePayroll = asyncHandler(async (req, res) => {
  if (!["Super Admin", "Admin", "HR", "Accountant"].includes(req.user.role)) throw new ApiError(403, "Permission denied");
  const { user, month, basicSalary, hra = 0, specialAllowance = 0, deductions = 0, advanceSalary = 0, leaveDeduction = 0, employeeCode, department, designation, dateOfJoining, uan = "", workingDays, paidLeave = 0 } = req.body;
  if (!user || !month) throw new ApiError(400, "Employee and month are required");
  const employee = await User.findById(user);
  if (!employee) throw new ApiError(404, "Employee not found");
  const staff = await Staff.findOne({ user });
  const { start, end, days } = monthRange(month);
  const rows = await Attendance.find({ user, date: { $gte: start, $lte: end } });
  const basic = basicSalary === undefined || basicSalary === null
    ? Number(employee.monthlySalary || staff?.monthlySalary || staff?.salary || 0)
    : Number(basicSalary);
  const grossAmount = basic + Number(hra) + Number(specialAllowance);
  const perDaySalary = days ? grossAmount / days : 0;
  const presentDays = rows.filter((row) => ["Present", "Late", "Pending Logout"].includes(row.status)).length;
  const leaveDays = rows.filter((row) => row.status === "Leave").length;
  const halfDays = rows.filter((row) => row.status === "Half Day").length;
  const lateMarks = rows.filter((row) => row.status === "Late").length;
  const payableDays = presentDays + leaveDays + halfDays * 0.5;
  // Attendance remains recorded for reporting, but only an explicitly entered
  // leave deduction can reduce the salary on the payroll slip.
  const explicitLeaveDeduction = Number(leaveDeduction || 0);
  const totalWorkingDays = workingDays === undefined || workingDays === null ? days : Number(workingDays);
  const netAmount = Math.max(grossAmount - explicitLeaveDeduction - Number(deductions) - Number(advanceSalary), 0);
  const payroll = await Salary.findOneAndUpdate(
    { user, month },
    {
      user,
      month,
      employeeCode: employeeCode || employee.employeeId || staff?.employeeCode || "Not Available",
      department: department || employee.department || staff?.department || "Not Available",
      designation: designation || employee.designation || staff?.designation || "Not Available",
      dateOfJoining: dateOfJoining || employee.dateOfJoining || staff?.joiningDate || null,
      uan: uan || "Not Available",
      workingDays: totalWorkingDays,
      paidLeave: Number(paidLeave || 0),
      monthlySalary: basic,
      basicSalary: basic,
      hra: Number(hra),
      specialAllowance: Number(specialAllowance),
      perDaySalary,
      payableDays,
      presentDays,
      leaveDays,
      lateMarks,
      halfDays,
      grossAmount,
      deductions: Number(deductions) + explicitLeaveDeduction,
      leaveDeduction: explicitLeaveDeduction,
      otherDeduction: Number(deductions),
      bonus: 0,
      incentives: 0,
      advanceSalary,
      netAmount,
      status: "Pending"
    },
    { new: true, upsert: true, runValidators: true }
  );
  await logActivity(req, "payroll-calculate", "salary", { payroll: payroll._id, month });
  res.json(payroll);
});

export const payrollSlip = asyncHandler(async (req, res) => {
  if (!['Super Admin', 'Admin', 'HR', 'Accountant'].includes(req.user.role)) throw new ApiError(403, 'Permission denied');
  const payroll = await Salary.findById(req.params.id)
    .populate('user', 'name employeeId department designation dateOfJoining')
    .lean();
  if (!payroll) throw new ApiError(404, 'Payroll record not found');

  const staff = payroll.user?._id ? await Staff.findOne({ user: payroll.user._id }).select('employeeCode joiningDate department designation').lean() : null;
  res.json({ payroll, employee: payroll.user, staff });
});

export const exportReport = asyncHandler(async (req, res) => {
  const type = req.query.type || "attendance";
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const { start, end } = monthRange(month);
  const rows = type === "salary"
    ? await Salary.find({ month }).populate("user", "name role department").lean()
    : type === "lecture"
      ? await LectureReport.find({ date: { $gte: start, $lte: end } }).populate("faculty", "name role department").lean()
      : await Attendance.find({ date: { $gte: start, $lte: end } }).populate("user", "name role department").lean();
  res.json({ type, month, format: req.query.format || "json", items: rows });
});
