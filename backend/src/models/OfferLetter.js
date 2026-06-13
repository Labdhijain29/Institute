import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const offerLetterSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    batch: { type: String, required: true, trim: true },
    feeOffered: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    offerDate: { type: Date, default: Date.now },
    remarks: String,
    createdBy: objectId("User")
  },
  baseOptions
);

export const OfferLetter = mongoose.model("OfferLetter", offerLetterSchema);
