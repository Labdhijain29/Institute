import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { hasPermission } from "../constants/roles.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "Authentication required");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");
  if (!user || !user.isActive) throw new ApiError(401, "Invalid or inactive user");
  if (user.role !== "Student" && (user.approvalStatus || "Approved") !== "Approved") {
    throw new ApiError(403, "Admin approval required");
  }

  req.user = user;
  req.sessionId = decoded.sessionId;
  next();
});

export const permit = (...permissions) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, "Authentication required"));
  const allowed = permissions.some((permission) => hasPermission(req.user.role, permission));
  if (!allowed) return next(new ApiError(403, "Permission denied"));
  next();
};

export const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, "Authentication required"));
  if (!roles.includes(req.user.role) && req.user.role !== "Super Admin") return next(new ApiError(403, "Role denied"));
  next();
};
