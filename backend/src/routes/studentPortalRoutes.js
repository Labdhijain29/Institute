import { Router } from "express";
import { changePassword, portalData } from "../controllers/studentPortalController.js";
import { ApiError } from "../utils/ApiError.js";

export const studentPortalRoutes = Router();

studentPortalRoutes.use((req, _res, next) => {
  if (req.user?.role !== "Student") return next(new ApiError(403, "Student access only"));
  next();
});
studentPortalRoutes.get("/me", portalData);
studentPortalRoutes.patch("/change-password", changePassword);
