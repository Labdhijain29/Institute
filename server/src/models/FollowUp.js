import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const followUpSchema = new mongoose.Schema(
  {
    lead: objectId("Lead"),
    student: objectId("Student"),
    assignedTo: objectId("User"),
    dueAt: { type: Date, required: true },
    type: { type: String, enum: ["Call", "Demo", "Fees", "Task", "General"], default: "Call" },
    status: { type: String, enum: ["Pending", "Done", "Missed"], default: "Pending" },
    remarks: String
  },
  baseOptions
);

export const FollowUp = mongoose.model("FollowUp", followUpSchema);
