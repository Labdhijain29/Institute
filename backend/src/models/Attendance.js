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
    breakDurationMinutes: { type: Number, default: 0 },
    ipAddress: String,
    publicIp: String,
    deviceInfo: String,
    browser: String,
    operatingSystem: String,
    deviceType: String,
    userAgent: String,
    city: String,
    state: String,
    country: String,
    timezone: String,
    latitude: Number,
    longitude: Number,
    sessionId: String,
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      city: String,
      state: String,
      country: String
    },
    security: {
      differentIp: Boolean,
      differentBrowser: Boolean,
      differentDevice: Boolean,
      multipleActiveSessions: Boolean,
      differentState: Boolean,
      differentCountry: Boolean
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
