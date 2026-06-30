import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const offerLetterSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, trim: true },
    email: String,
    phone: String,
    address: String,
    courseName: { type: String, required: true, trim: true },
    department: String,
    batch: { type: String, required: true, trim: true },
    duration: String,
    feeOffered: { type: Number, required: true, min: 0 },
    scholarship: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, default: 0, min: 0 },
    paymentSchedule: String,
    startDate: { type: Date, required: true },
    endDate: Date,
    offerDate: { type: Date, default: Date.now },
    joiningDate: Date,
    validTill: Date,
    authorizedSignatory: String,
    hrContact: String,
    branchLocation: String,
    reportingManager: String,
    trainingLocation: String,
    mode: { type: String, default: "Offline" },
    documentNumber: String,
    offerLetterId: String,
    companyCinGst: String,
    remarks: String,
    createdBy: objectId("User")
  },
  baseOptions
);

export const OfferLetter = mongoose.model("OfferLetter", offerLetterSchema);
