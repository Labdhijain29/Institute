import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const lectureReportSchema = new mongoose.Schema(
  {
    faculty: { ...objectId("User"), required: true },
    date: { type: Date, required: true },
    course: objectId("Course"),
    courseName: String,
    batch: objectId("Batch"),
    batchName: String,
    classTiming: String,
    topicTaught: { type: String, required: true },
    durationMinutes: { type: Number, default: 0 },
    studentAttendanceCount: { type: Number, default: 0 },
    status: { type: String, enum: ["Submitted", "Pending", "Reviewed"], default: "Submitted" },
    notes: String,
    remarks: String,
    reviewedBy: objectId("User"),
    reviewedAt: Date
  },
  baseOptions
);

export const LectureReport = mongoose.model("LectureReport", lectureReportSchema);
