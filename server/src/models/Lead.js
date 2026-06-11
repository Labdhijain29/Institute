import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const callHistorySchema = new mongoose.Schema(
  {
    by: objectId("User"),
    status: String,
    remarks: String,
    followUpDate: Date,
    durationSeconds: Number,
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: String,
    courseInterested: objectId("Course"),
    source: { type: String, default: "Walk-in" },
    priority: { type: String, enum: ["Hot", "Warm", "Cold"], default: "Warm" },
    status: {
      type: String,
      enum: ["New", "Assigned", "Contacted", "Interested", "Not Interested", "Follow-up", "Forwarded", "Demo Scheduled", "Converted", "Lost"],
      default: "New"
    },
    telecallerAssigned: objectId("User"),
    counsellorAssigned: objectId("User"),
    followUpDate: Date,
    remarks: String,
    callHistory: [callHistorySchema],
    forwardedBy: objectId("User"),
    forwardedAt: Date,
    convertedStudent: objectId("Student"),
    convertedAt: Date,
    branch: objectId("Branch"),
    createdBy: objectId("User")
  },
  baseOptions
);

export const Lead = mongoose.model("Lead", leadSchema);
