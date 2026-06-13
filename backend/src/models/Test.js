import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const testResultSchema = new mongoose.Schema(
  {
    student: objectId("Student"),
    marks: Number,
    maxMarks: Number,
    feedback: String
  },
  { _id: false }
);

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: objectId("Course"),
    batch: objectId("Batch"),
    scheduledAt: Date,
    results: [testResultSchema],
    createdBy: objectId("User")
  },
  baseOptions
);

export const Test = mongoose.model("Test", testSchema);
