import { Router } from "express";
import { assignStudent } from "../controllers/studentEnrollmentController.js";
import { allowRoles } from "../middleware/auth.js";

export const studentEnrollmentRoutes = Router();

studentEnrollmentRoutes.patch("/:id/assign", allowRoles("Admin"), assignStudent);
