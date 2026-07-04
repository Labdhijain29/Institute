import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const staffSchema = new mongoose.Schema(
  {
    user: objectId("User"),
    employeeCode: { type: String, unique: true, sparse: true },
    fullName: String,
    mobile: String,
    email: String,
    address: String,
    department: String,
    designation: String,
    joiningDate: Date,
    role: String,
    salary: Number,
    monthlySalary: Number,
    bankDetails: {
      accountHolder: String,
      bankName: String,
      accountNumber: String,
      ifsc: String,
      upiId: String
    },
    emergencyContact: {
      name: String,
      relation: String,
      mobile: String
    },
    documents: [
      {
        name: String,
        fileType: String,
        size: Number,
        url: String
      }
    ],
    status: { type: String, enum: ["Active", "Inactive", "Left"], default: "Active" },
    performance: String
  },
  baseOptions
);

export const Staff = mongoose.model("Staff", staffSchema);
