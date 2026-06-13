import mongoose from "mongoose";
import { baseOptions } from "./shared.js";

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    duration: String,
    fees: { type: Number, default: 0 },
    description: String,
    modules: [{ type: String }],
    technologies: [{ type: String }],
    syllabus: String,
    isActive: { type: Boolean, default: true }
  },
  baseOptions
);

export const Course = mongoose.model("Course", courseSchema);
