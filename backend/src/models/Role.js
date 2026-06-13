import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";
import { baseOptions } from "./shared.js";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ROLES, unique: true, required: true },
    permissions: [{ type: String }]
  },
  baseOptions
);

export const Role = mongoose.model("Role", roleSchema);
