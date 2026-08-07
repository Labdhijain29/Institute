import { Router } from "express";
import {
  applyLeave,
  calculatePayroll,
  correctAttendance,
  employeeList,
  employeeSummary,
  exportReport,
  listLeaves,
  listLectureReports,
  loginAttendance,
  logoutAttendance,
  myEmployeeDashboard,
  payrollEmployeeOptions,
  payrollSlip,
  reviewLeave,
  submitLectureReport
} from "../controllers/employeeController.js";
import { permit } from "../middleware/auth.js";

export const employeeRoutes = Router();

employeeRoutes.get("/summary", permit("reports:read"), employeeSummary);
employeeRoutes.get("/employees", permit("staff:read"), employeeList);
employeeRoutes.get("/payroll-employees", permit("salary:create"), payrollEmployeeOptions);
employeeRoutes.get("/me", myEmployeeDashboard);
employeeRoutes.post("/attendance/login", loginAttendance);
employeeRoutes.post("/attendance/logout", logoutAttendance);
employeeRoutes.patch("/attendance/:id/correct", permit("attendance:update"), correctAttendance);
employeeRoutes.get("/leaves", listLeaves);
employeeRoutes.post("/leaves", applyLeave);
employeeRoutes.patch("/leaves/:id/review", permit("leaves:update"), reviewLeave);
employeeRoutes.get("/lecture-reports", listLectureReports);
employeeRoutes.post("/lecture-reports", submitLectureReport);
employeeRoutes.post("/payroll/calculate", permit("salary:create"), calculatePayroll);
employeeRoutes.get("/payroll/:id/slip", permit("salary:read"), payrollSlip);
employeeRoutes.get("/reports/export", permit("reports:read"), exportReport);
