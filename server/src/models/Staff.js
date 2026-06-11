import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const staffSchema = new mongoose.Schema(
  {
    user: objectId("User"),
    employeeCode: { type: String, unique: true, sparse: true },
    department: String,
    designation: String,
    joiningDate: Date,
    salary: Number,
    status: { type: String, enum: ["Active", "Inactive", "Left"], default: "Active" },
    performance: String
  },
  baseOptions
);

export const Staff = mongoose.model("Staff", staffSchema);
