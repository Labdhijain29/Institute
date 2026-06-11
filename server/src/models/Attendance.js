import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    type: { type: String, enum: ["Student", "Faculty", "Staff"], required: true },
    student: objectId("Student"),
    user: objectId("User"),
    batch: objectId("Batch"),
    status: { type: String, enum: ["Present", "Absent", "Late", "Leave"], required: true },
    markedBy: objectId("User"),
    remarks: String
  },
  baseOptions
);

export const Attendance = mongoose.model("Attendance", attendanceSchema);
