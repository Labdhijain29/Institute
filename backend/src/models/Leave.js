import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const leaveSchema = new mongoose.Schema(
  {
    user: { ...objectId("User"), required: true },
    leaveType: { type: String, enum: ["Casual", "Sick", "Paid", "Unpaid"], required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    days: { type: Number, default: 1 },
    reason: String,
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    approvedBy: objectId("User"),
    approvedAt: Date,
    remarks: String,
    salaryImpact: { type: String, enum: ["None", "Paid", "Deductible"], default: "None" }
  },
  baseOptions
);

export const Leave = mongoose.model("Leave", leaveSchema);
