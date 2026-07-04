import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const attendanceSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    type: { type: String, enum: ["Student", "Faculty", "Staff"], required: true },
    student: objectId("Student"),
    user: objectId("User"),
    batch: objectId("Batch"),
    loginTime: Date,
    logoutTime: Date,
    totalWorkingMinutes: { type: Number, default: 0 },
    ipAddress: String,
    deviceInfo: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    status: { type: String, enum: ["Present", "Absent", "Late", "Half Day", "Leave", "Pending Logout"], required: true },
    correctionReason: String,
    correctedBy: objectId("User"),
    correctedAt: Date,
    markedBy: objectId("User"),
    remarks: String
  },
  baseOptions
);

export const Attendance = mongoose.model("Attendance", attendanceSchema);
