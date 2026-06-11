import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: String,
    type: { type: String, enum: ["Lead", "FollowUp", "Fees", "Demo", "Attendance", "Task", "Notice"], default: "Notice" },
    user: objectId("User"),
    role: String,
    readAt: Date
  },
  baseOptions
);

export const Notification = mongoose.model("Notification", notificationSchema);
