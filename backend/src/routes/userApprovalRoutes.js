import { Router } from "express";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const userApprovalRoutes = Router();

userApprovalRoutes.patch(
  "/:id/approval",
  (req, _res, next) => ["Admin", "Super Admin"].includes(req.user?.role) ? next() : next(new ApiError(403, "Admin access required")),
  asyncHandler(async (req, res) => {
    if (!["Pending", "Approved", "Rejected"].includes(req.body.status)) throw new ApiError(400, "Invalid approval status");
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");
    if (user.role === "Student") throw new ApiError(400, "Student accounts do not require approval");
    if (String(user._id) === String(req.user._id)) throw new ApiError(400, "You cannot review your own account");

    user.approvalStatus = req.body.status;
    user.approvalReviewedBy = req.user._id;
    user.approvalReviewedAt = new Date();
    await user.save();
    res.json({ message: `User ${req.body.status.toLowerCase()} successfully`, user });
  })
);
