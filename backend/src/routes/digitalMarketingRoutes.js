import { Router } from "express";
import * as controller from "../controllers/digitalMarketingController.js";
import { ApiError } from "../utils/ApiError.js";

export const digitalMarketingRoutes = Router();
const exactRole = (...roles) => (req, _res, next) => roles.includes(req.user?.role) ? next() : next(new ApiError(403, "Role denied"));
const executiveOnly = exactRole("Digital Marketing Executive");
const adminOnly = exactRole("Admin", "Super Admin");

digitalMarketingRoutes.get("/me/dashboard", executiveOnly, controller.executiveDashboard);
digitalMarketingRoutes.get("/me/leads", executiveOnly, controller.myLeads);
digitalMarketingRoutes.patch("/me/leads/:id", executiveOnly, controller.updateMyLead);
digitalMarketingRoutes.get("/me/follow-ups", executiveOnly, controller.myFollowUps);
digitalMarketingRoutes.post("/me/follow-ups", executiveOnly, controller.createMyFollowUp);
digitalMarketingRoutes.patch("/me/follow-ups/:id", executiveOnly, controller.updateMyFollowUp);
digitalMarketingRoutes.get("/me/tasks", executiveOnly, controller.myTasks);
digitalMarketingRoutes.patch("/me/tasks/:id", executiveOnly, controller.updateMyTask);
digitalMarketingRoutes.get("/me/profile", executiveOnly, controller.marketingProfile);
digitalMarketingRoutes.patch("/me/change-password", executiveOnly, controller.changeMarketingPassword);

digitalMarketingRoutes.get("/admin/executives", adminOnly, controller.listExecutives);
digitalMarketingRoutes.post("/admin/executives", adminOnly, controller.createExecutive);
digitalMarketingRoutes.patch("/admin/executives/:id", adminOnly, controller.updateExecutive);
digitalMarketingRoutes.delete("/admin/executives/:id", adminOnly, controller.deleteExecutive);
digitalMarketingRoutes.get("/admin/leads", adminOnly, controller.adminMarketingLeads);
digitalMarketingRoutes.patch("/admin/leads/:id/assign", adminOnly, controller.assignMarketingLead);
digitalMarketingRoutes.get("/admin/follow-ups", adminOnly, controller.adminMarketingFollowUps);
digitalMarketingRoutes.get("/admin/tasks", adminOnly, controller.adminMarketingTasks);
digitalMarketingRoutes.post("/admin/tasks", adminOnly, controller.createMarketingTask);
