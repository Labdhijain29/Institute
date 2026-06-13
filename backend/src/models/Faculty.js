import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const facultySchema = new mongoose.Schema(
  {
    user: objectId("User"),
    assignedCourses: [objectId("Course")],
    assignedBatches: [objectId("Batch")],
    salary: Number,
    performance: String,
    leaveBalance: { type: Number, default: 0 },
    tasks: [objectId("Task")]
  },
  baseOptions
);

export const Faculty = mongoose.model("Faculty", facultySchema);
