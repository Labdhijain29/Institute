import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const salarySchema = new mongoose.Schema(
  {
    user: objectId("User"),
    month: { type: String, required: true },
    grossAmount: Number,
    deductions: Number,
    netAmount: Number,
    status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    paidAt: Date,
    paidBy: objectId("User")
  },
  baseOptions
);

export const Salary = mongoose.model("Salary", salarySchema);
