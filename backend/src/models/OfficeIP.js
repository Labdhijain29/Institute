import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const officeIPSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    ipAddress: { type: String, required: true, trim: true },
    cidr: String,
    isActive: { type: Boolean, default: true },
    addedBy: objectId("User"),
    remarks: String
  },
  baseOptions
);

export const OfficeIP = mongoose.model("OfficeIP", officeIPSchema);
