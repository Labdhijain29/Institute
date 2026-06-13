import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
    deadline: Date,
    status: { type: String, enum: ["Pending", "In Progress", "Done", "Blocked"], default: "Pending" },
    assignedBy: objectId("User"),
    assignedTo: objectId("User"),
    remarks: String
  },
  baseOptions
);

export const Task = mongoose.model("Task", taskSchema);
