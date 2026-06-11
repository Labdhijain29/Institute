import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const installmentSchema = new mongoose.Schema(
  {
    amount: Number,
    dueDate: Date,
    status: { type: String, enum: ["Pending", "Paid", "Overdue"], default: "Pending" }
  },
  { _id: false }
);

const feeSchema = new mongoose.Schema(
  {
    student: objectId("Student"),
    course: objectId("Course"),
    totalFees: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    paidFees: { type: Number, default: 0 },
    pendingFees: { type: Number, default: 0 },
    installments: [installmentSchema],
    createdBy: objectId("User")
  },
  baseOptions
);

export const Fee = mongoose.model("Fee", feeSchema);
