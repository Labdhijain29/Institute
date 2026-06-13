import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true, unique: true, trim: true },
    student: { ...objectId("Student"), required: true },
    payment: objectId("Payment"),
    paymentDate: { type: Date, default: Date.now },
    paymentMode: { type: String, enum: ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"], default: "Cash" },
    transactionId: { type: String, trim: true },
    tuitionFee: { type: Number, default: 0 },
    registrationFee: { type: Number, default: 0 },
    studyMaterialFee: { type: Number, default: 0 },
    examFee: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalCourseFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    previousDue: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    createdBy: objectId("User")
  },
  baseOptions
);

receiptSchema.pre("validate", function calculateReceiptTotals(next) {
  const gross =
    Number(this.tuitionFee || 0) +
    Number(this.registrationFee || 0) +
    Number(this.studyMaterialFee || 0) +
    Number(this.examFee || 0) +
    Number(this.otherCharges || 0);

  this.totalAmount = Math.max(gross - Number(this.discount || 0), 0);
  this.amountPaid = Number(this.amountPaid || this.totalAmount || 0);
  this.totalCourseFee = Number(this.totalCourseFee || gross || this.totalAmount || 0);
  this.remainingBalance = Math.max(
    Number(this.totalCourseFee || 0) - Number(this.amountPaid || 0) + Number(this.previousDue || 0),
    0
  );
  next();
});

export const Receipt = mongoose.model("Receipt", receiptSchema);
