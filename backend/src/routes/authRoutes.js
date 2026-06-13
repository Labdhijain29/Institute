import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", protect, me);
authRoutes.post("/forgot-password", (_req, res) => res.json({ message: "Connect email/SMS provider to issue reset token." }));
authRoutes.post("/reset-password", (_req, res) => res.json({ message: "Reset password endpoint placeholder." }));
