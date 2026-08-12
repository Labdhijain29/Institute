import { Router } from "express";
import { listEmployeeAttendance, monthlyAttendanceSummary, scanAttendance, todayAttendance } from "../controllers/attendanceController.js";
import { permit } from "../middleware/auth.js";

export const attendanceRoutes = Router();
attendanceRoutes.post("/scan", scanAttendance);
attendanceRoutes.get("/today", todayAttendance);
attendanceRoutes.get("/employee/:employeeId", listEmployeeAttendance);
attendanceRoutes.get("/monthly/:employeeId", monthlyAttendanceSummary);
attendanceRoutes.get("/", permit("attendance:read"), (_req, res, next) => next());
