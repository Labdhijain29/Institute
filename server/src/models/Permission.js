import mongoose from "mongoose";
import { baseOptions } from "./shared.js";

const permissionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    module: { type: String, required: true },
    action: { type: String, required: true },
    description: String
  },
  baseOptions
);

export const Permission = mongoose.model("Permission", permissionSchema);
