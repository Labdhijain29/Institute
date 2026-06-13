import mongoose from "mongoose";
import { addressSchema, baseOptions } from "./shared.js";

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    mobile: String,
    email: String,
    address: addressSchema,
    isActive: { type: Boolean, default: true }
  },
  baseOptions
);

export const Branch = mongoose.model("Branch", branchSchema);
