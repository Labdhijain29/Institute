import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const activityLogSchema = new mongoose.Schema(
  {
    user: objectId("User"),
    action: { type: String, required: true },
    module: String,
    entityId: String,
    ipAddress: String,
    deviceInfo: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  baseOptions
);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
