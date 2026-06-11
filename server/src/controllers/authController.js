import { ROLE_PERMISSIONS, ROLES } from "../constants/roles.js";
import { User } from "../models/User.js";
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
      role: user.role,
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
    documents
  });
  res.status(201).json({ message: "Registration successful. Please login with your email and password.", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, "Invalid credentials");
  if (!user.isActive) throw new ApiError(403, "User is inactive");
  res.json(authPayload(user));
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user, permissions: ROLE_PERMISSIONS[req.user.role] || [] });
});
