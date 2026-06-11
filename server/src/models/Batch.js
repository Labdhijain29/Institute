import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    course: objectId("Course"),
    faculty: objectId("User"),
    timing: String,
    startDate: Date,
    endDate: Date,
    students: [objectId("Student")],
    status: { type: String, enum: ["Upcoming", "Running", "Completed", "Cancelled"], default: "Upcoming" }
  },
  baseOptions
);

export const Batch = mongoose.model("Batch", batchSchema);
