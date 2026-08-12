import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const salarySchema = new mongoose.Schema(
  {
    user: objectId("User"),
    month: { type: String, required: true },
    employeeCode: String,
    department: String,
    designation: String,
    dateOfJoining: Date,
    uan: String,
    workingDays: { type: Number, default: 0 },
    paidLeave: { type: Number, default: 0 },
    monthlySalary: { type: Number, default: 0 },
    basicSalary: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    perDaySalary: { type: Number, default: 0 },
    payableDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    unpaidLeave: { type: Number, default: 0 },
    lateMarks: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    totalWorkingHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    attendanceDeduction: { type: Number, default: 0 },
    grossAmount: Number,
    deductions: { type: Number, default: 0 },
    // Stored separately so a payslip can show the existing payroll calculation
    // as meaningful line items without changing the total deduction workflow.
    leaveDeduction: { type: Number, default: 0 },
    otherDeduction: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    advanceSalary: { type: Number, default: 0 },
    netAmount: Number,
    status: { type: String, enum: ["Pending", "Approved", "Paid"], default: "Pending" },
    approvedBy: objectId("User"),
    approvedAt: Date,
    paidAt: Date,
    paidBy: objectId("User")
  },
  baseOptions
);

export const Salary = mongoose.model("Salary", salarySchema);
