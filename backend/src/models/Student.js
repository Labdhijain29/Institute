import mongoose from "mongoose";
import { addressSchema, baseOptions, documentSchema, objectId } from "./shared.js";

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: String,
    mobile: String,
    parentName: String,
    parentMobile: String,
    address: addressSchema,
    course: objectId("Course"),
    courseName: String,
    batch: objectId("Batch"),
    user: objectId("User"),
    admissionDate: Date,
    documents: [documentSchema],
    performance: String,
    status: { type: String, enum: ["Active", "Completed", "Dropout"], default: "Active" },
    createdBy: objectId("User")
  },
  baseOptions
);

export const Student = mongoose.model("Student", studentSchema);
