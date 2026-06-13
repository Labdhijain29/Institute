import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: { type: String, unique: true, sparse: true, trim: true },
    certificateNo: { type: String, unique: true, sparse: true, trim: true },
    studentName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    batch: { type: String, required: true, trim: true },
    student: objectId("Student"),
    course: objectId("Course"),
    issueDate: { type: Date, default: Date.now },
    pdfUrl: String,
    downloadUrl: String,
    issuedBy: objectId("User")
  },
  baseOptions
);

certificateSchema.pre("validate", function syncLegacyCertificateNumber(next) {
  if (!this.certificateNo && this.certificateNumber) this.certificateNo = this.certificateNumber;
  if (!this.certificateNumber && this.certificateNo) this.certificateNumber = this.certificateNo;
  next();
});

export const Certificate = mongoose.model("Certificate", certificateSchema);
