import { Router } from "express";
import { addCallHistory, assignLead, convertToAdmission, forwardToCounsellor } from "../controllers/leadController.js";
import { crudController } from "../controllers/crudController.js";
import { permit } from "../middleware/auth.js";
import { Lead } from "../models/Lead.js";

export const leadRoutes = Router();
const crud = crudController(Lead, { searchFields: ["name", "mobile", "email", "source", "remarks"] });

leadRoutes.get("/", permit("leads:read"), crud.list);
leadRoutes.get("/:id", permit("leads:read"), crud.get);
leadRoutes.post("/", permit("leads:create"), crud.create);
leadRoutes.patch("/:id", permit("leads:update"), crud.update);
leadRoutes.delete("/:id", permit("leads:delete"), crud.remove);
leadRoutes.post("/:id/assign", permit("leads:update"), assignLead);
leadRoutes.post("/:id/call-history", permit("leads:update"), addCallHistory);
leadRoutes.post("/:id/forward", permit("leads:forward"), forwardToCounsellor);
leadRoutes.post("/:id/convert", permit("leads:convert"), convertToAdmission);
