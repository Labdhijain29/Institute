import { Router } from "express";
import { crudController } from "../controllers/crudController.js";
import { dashboardSummary } from "../controllers/reportController.js";
import { protect, permit } from "../middleware/auth.js";
import { Assignment } from "../models/Assignment.js";
import { Attendance } from "../models/Attendance.js";
import { Batch } from "../models/Batch.js";
import { Branch } from "../models/Branch.js";
import { Course } from "../models/Course.js";
import { DemoClass } from "../models/DemoClass.js";
import { Expense } from "../models/Expense.js";
import { Faculty } from "../models/Faculty.js";
import { Fee } from "../models/Fee.js";
import { FollowUp } from "../models/FollowUp.js";
import { Leave } from "../models/Leave.js";
import { LectureReport } from "../models/LectureReport.js";
import { Notification } from "../models/Notification.js";
import { OfficeIP } from "../models/OfficeIP.js";
import { Payment } from "../models/Payment.js";
import { Permission } from "../models/Permission.js";
import { Role } from "../models/Role.js";
import { Salary } from "../models/Salary.js";
import { Setting } from "../models/Setting.js";
import { Staff } from "../models/Staff.js";
import { Student } from "../models/Student.js";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { Task } from "../models/Task.js";
import { Test } from "../models/Test.js";
import { User } from "../models/User.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { authRoutes } from "./authRoutes.js";
import { certificateRoutes } from "./certificateRoutes.js";
import { leadRoutes } from "./leadRoutes.js";
import { offerRoutes } from "./offerRoutes.js";
import { publicRoutes } from "./publicRoutes.js";
import { receiptRoutes } from "./receiptRoutes.js";
import { resourceRoutes } from "./resourceRoutes.js";
import { studentPortalRoutes } from "./studentPortalRoutes.js";
import { studentEnrollmentRoutes } from "./studentEnrollmentRoutes.js";
import { digitalMarketingRoutes } from "./digitalMarketingRoutes.js";
import { employeeRoutes } from "./employeeRoutes.js";
import { userApprovalRoutes } from "./userApprovalRoutes.js";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/public", publicRoutes);
apiRoutes.use(protect);
apiRoutes.use("/student-portal", studentPortalRoutes);
apiRoutes.use("/student-enrollment", studentEnrollmentRoutes);
apiRoutes.use("/digital-marketing", digitalMarketingRoutes);
apiRoutes.use("/employee", employeeRoutes);

const make = (model, module, searchFields = []) => {
  const crud = crudController(model, { searchFields });
  return resourceRoutes(crud, {
    read: permit(`${module}:read`),
    create: permit(`${module}:create`),
    update: permit(`${module}:update`),
    remove: permit(`${module}:delete`)
  });
};

apiRoutes.use("/users", userApprovalRoutes);
apiRoutes.use("/users", make(User, "users", ["name", "email", "mobile", "role"]));
apiRoutes.use("/roles", make(Role, "settings", ["name"]));
apiRoutes.use("/permissions", make(Permission, "settings", ["key", "module"]));
apiRoutes.use("/leads", leadRoutes);
apiRoutes.use("/follow-ups", make(FollowUp, "followups"));
apiRoutes.use("/students", make(Student, "students", ["studentId", "name", "mobile", "email"]));
apiRoutes.use("/courses", make(Course, "courses", ["name", "description"]));
apiRoutes.use("/batches", make(Batch, "batches", ["name", "timing"]));
apiRoutes.use("/faculty", make(Faculty, "staff"));
apiRoutes.use("/staff", make(Staff, "staff", ["employeeCode", "department", "designation"]));
apiRoutes.use("/fees", make(Fee, "fees"));
apiRoutes.use("/payments", make(Payment, "payments", ["receiptNo", "mode"]));
apiRoutes.use("/receipts", receiptRoutes);
apiRoutes.use("/attendance", make(Attendance, "attendance"));
apiRoutes.use("/leaves", make(Leave, "leaves"));
apiRoutes.use("/lecture-reports", make(LectureReport, "lectures", ["topicTaught", "courseName", "batchName"]));
apiRoutes.use("/demo-classes", make(DemoClass, "demos", ["studentName", "feedback"]));
apiRoutes.use("/tasks", make(Task, "tasks", ["title", "description"]));
apiRoutes.use("/study-materials", make(StudyMaterial, "materials", ["title", "type"]));
apiRoutes.use("/assignments", make(Assignment, "assignments", ["title", "description"]));
apiRoutes.use("/tests", make(Test, "tests", ["title"]));
apiRoutes.use("/certificates", certificateRoutes);
apiRoutes.use("/offers", offerRoutes);
apiRoutes.use("/notifications", make(Notification, "notices", ["title", "message"]));
apiRoutes.use("/expenses", make(Expense, "expenses", ["title", "category"]));
apiRoutes.use("/salaries", make(Salary, "salary", ["month"]));
apiRoutes.use("/office-ips", make(OfficeIP, "settings", ["label", "ipAddress"]));
apiRoutes.use("/activity-logs", make(ActivityLog, "reports", ["action", "module"]));
apiRoutes.use("/branches", make(Branch, "settings", ["name", "code"]));
apiRoutes.use("/settings", make(Setting, "settings", ["key", "group"]));
apiRoutes.get("/reports/dashboard", permit("reports:read"), dashboardSummary);
