import mongoose from "mongoose";

export const objectId = (ref) => ({ type: mongoose.Schema.Types.ObjectId, ref });

export const baseOptions = { timestamps: true };

export const addressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String
  },
  { _id: false }
);

export const documentSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);
