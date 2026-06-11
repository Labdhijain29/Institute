import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: String,
    paidAt: Date,
    mode: String,
    branch: objectId("Branch"),
    createdBy: objectId("User")
  },
  baseOptions
);

export const Expense = mongoose.model("Expense", expenseSchema);
