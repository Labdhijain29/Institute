import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const submissionSchema = new mongoose.Schema(
  {
    student: objectId("Student"),
    fileUrl: String,
    submittedAt: Date,
    marks: Number,
    feedback: String
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    fileUrl: String,
    course: objectId("Course"),
    batch: objectId("Batch"),
    dueAt: Date,
    uploadedBy: objectId("User"),
    submissions: [submissionSchema]
  },
  baseOptions
);

export const Assignment = mongoose.model("Assignment", assignmentSchema);
