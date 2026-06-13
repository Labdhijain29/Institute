import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const demoClassSchema = new mongoose.Schema(
  {
    lead: objectId("Lead"),
    studentName: String,
    course: objectId("Course"),
    faculty: objectId("User"),
    scheduledAt: Date,
    status: { type: String, enum: ["Booked", "Completed", "Cancelled", "Converted"], default: "Booked" },
    feedback: String,
    createdBy: objectId("User")
  },
  baseOptions
);

export const DemoClass = mongoose.model("DemoClass", demoClassSchema);
