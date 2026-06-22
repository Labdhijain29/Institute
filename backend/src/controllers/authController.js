import { ROLE_PERMISSIONS, ROLES } from "../constants/roles.js";
import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/token.js";

function authPayload(user) {
  return {
    token: signToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      avatar: user.avatar,
      role: user.role,
      approvalStatus: user.approvalStatus || "Approved",
      branch: user.branch,
      permissions: ROLE_PERMISSIONS[user.role] || []
    }
  };
}

export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role = "Student",
    mobile,
    alternateMobile,
    branch,
    address,
    dateOfJoining,
    franchise,
    documents = []
  } = req.body;
  if (!ROLES.includes(role)) throw new ApiError(400, "Invalid role");
  const userCount = await User.countDocuments();
  if (role === "Super Admin" && userCount > 0) throw new ApiError(403, "Super Admin can only be bootstrapped as the first user");
  if (role === "Admin") throw new ApiError(403, "Admin accounts cannot be created from public registration");
  if (role === "Digital Marketing Executive") throw new ApiError(403, "Digital Marketing accounts can only be created by an administrator");
  if (dateOfJoining) {
    const joiningDate = new Date(dateOfJoining);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(joiningDate.getTime()) || joiningDate < today) throw new ApiError(400, "Date of joining cannot be in the past");
  }

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "Email already registered");

  const user = await User.create({
    name,
    email,
    password,
    role,
    mobile,
    alternateMobile,
    branch,
    address,
    dateOfJoining,
    franchise,
    documents,
    approvalStatus: role === "Student" || (role === "Super Admin" && userCount === 0) ? "Approved" : "Pending"
  });
  if (user.role === "Student") {
    await Student.create({
      studentId: `STU-${new Date().getFullYear()}-${String(user._id).slice(-8).toUpperCase()}`,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      user: user._id,
      admissionDate: user.dateOfJoining || new Date(),
      status: "Active"
    });
  }
  const message = user.role === "Student"
    ? "Registration successful. Please login with your email and password."
    : "Registration successful. Your account is pending Admin approval.";
  res.status(201).json({ message, user: { id: user._id, name: user.name, email: user.email, role: user.role, approvalStatus: user.approvalStatus } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, "Invalid credentials");
  if (!user.isActive) throw new ApiError(403, "User is inactive");
  if (user.role !== "Student" && (user.approvalStatus || "Approved") !== "Approved") {
    throw new ApiError(403, user.approvalStatus === "Rejected" ? "Your account registration was rejected by Admin" : "Your account is pending Admin approval");
  }
  if (user.role === "Student") {
    const existingStudent = await Student.findOne({ $or: [{ user: user._id }, { email: user.email }] });
    if (!existingStudent) {
      await Student.create({
        studentId: `STU-${new Date().getFullYear()}-${String(user._id).slice(-8).toUpperCase()}`,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        user: user._id,
        admissionDate: user.dateOfJoining || new Date(),
        status: "Active"
      });
    } else if (!existingStudent.user) {
      existingStudent.user = user._id;
      await existingStudent.save();
    }
  }
  res.json(authPayload(user));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user, permissions: ROLE_PERMISSIONS[req.user.role] || [] });
});
