import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const certificateSchema = new mongoose.Schema(
  {
    certificateNo: { type: String, required: true, unique: true },
    student: objectId("Student"),
    course: objectId("Course"),
    issueDate: { type: Date, default: Date.now },
    downloadUrl: String,
    issuedBy: objectId("User")
  },
  baseOptions
);

export const Certificate = mongoose.model("Certificate", certificateSchema);
