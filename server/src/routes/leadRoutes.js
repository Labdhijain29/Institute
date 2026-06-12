import { Router } from "express";
import { addCallHistory, approveAdmission, assignLead, convertToAdmission, facultyOptions, forwardToCounsellor, forwardToFaculty } from "../controllers/leadController.js";
import { crudController } from "../controllers/crudController.js";
import { permit } from "../middleware/auth.js";
import { Lead } from "../models/Lead.js";

export const leadRoutes = Router();
const crud = crudController(Lead, {
  searchFields: ["name", "mobile", "email", "source", "remarks"],
  filter(req) {
    if (["Super Admin", "Admin", "Manager"].includes(req.user.role)) return {};
    if (req.user.role === "Telecaller") return { $or: [{ createdBy: req.user._id }, { telecallerAssigned: req.user._id }] };
    if (req.user.role === "Counsellor") return { $or: [{ counsellorAssigned: req.user._id }, { status: { $in: ["Forwarded", "Forwarded to Counsellor"] } }] };
    if (req.user.role === "Faculty") return { $or: [{ facultyAssigned: req.user._id }, { status: "Forwarded to Faculty" }] };
    return { createdBy: req.user._id };
  }
});

leadRoutes.get("/", permit("leads:read"), crud.list);
leadRoutes.get("/faculty-options", permit("leads:read"), facultyOptions);
leadRoutes.get("/:id", permit("leads:read"), crud.get);
leadRoutes.post("/", permit("leads:create"), crud.create);
leadRoutes.patch("/:id", permit("leads:update"), crud.update);
leadRoutes.delete("/:id", permit("leads:delete"), crud.remove);
leadRoutes.post("/:id/assign", permit("leads:update"), assignLead);
leadRoutes.post("/:id/call-history", permit("leads:update"), addCallHistory);
leadRoutes.post("/:id/forward", permit("leads:forward"), forwardToCounsellor);
leadRoutes.post("/:id/forward-faculty", permit("leads:forward"), forwardToFaculty);
leadRoutes.post("/:id/approve-admission", permit("leads:approve"), approveAdmission);
leadRoutes.post("/:id/convert", permit("leads:convert"), convertToAdmission);
