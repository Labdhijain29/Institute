import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { ROLES } from "../constants/roles.js";
import { baseOptions, objectId } from "./shared.js";

const userDocumentSchema = new mongoose.Schema(
  {
    name: String,
    fileType: String,
    size: Number
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: String,
    alternateMobile: String,
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, required: true, default: "Student" },
    branch: objectId("Branch"),
    address: {
      permanent: String,
      current: String,
      state: String,
      city: String,
      pincode: String
    },
    course: objectId("Course"),
    courseName: String,
    facultySpecialty: String,
    dateOfJoining: Date,
    franchise: { type: String, default: "No Franchise" },
    documents: [userDocumentSchema],
    avatar: String,
    isActive: { type: Boolean, default: true },
    approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Approved" },
    approvalReviewedBy: objectId("User"),
    approvalReviewedAt: Date,
    lastLoginAt: Date
  },
  baseOptions
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.pre("findOneAndUpdate", async function hashUpdatedPassword(next) {
  const update = this.getUpdate();
  if (!update?.password) return next();
  update.password = await bcrypt.hash(update.password, 12);
  next();
});

export const User = mongoose.model("User", userSchema);
