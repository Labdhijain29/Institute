import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["PDF", "Video", "Notes", "Link"], default: "PDF" },
    url: { type: String, required: true },
    course: objectId("Course"),
    batch: objectId("Batch"),
    uploadedBy: objectId("User"),
    isActive: { type: Boolean, default: true }
  },
  baseOptions
);

export const StudyMaterial = mongoose.model("StudyMaterial", studyMaterialSchema);
