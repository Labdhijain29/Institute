import mongoose from "mongoose";
import { baseOptions } from "./shared.js";

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    group: { type: String, default: "general" }
  },
  baseOptions
);

export const Setting = mongoose.model("Setting", settingSchema);
