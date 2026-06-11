import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const paymentSchema = new mongoose.Schema(
  {
    fee: objectId("Fee"),
    student: objectId("Student"),
    amount: { type: Number, required: true },
    mode: { type: String, enum: ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"], default: "Cash" },
    receiptNo: { type: String, required: true, unique: true },
    paidAt: { type: Date, default: Date.now },
    receivedBy: objectId("User"),
    note: String
  },
  baseOptions
);

export const Payment = mongoose.model("Payment", paymentSchema);
