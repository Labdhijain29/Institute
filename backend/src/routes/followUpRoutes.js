import { Router } from "express";
import { createFollowUp, deleteFollowUp, listFollowUps, updateFollowUp } from "../controllers/followUpController.js";
import { permit } from "../middleware/auth.js";

export const followUpRoutes = Router();

followUpRoutes.get("/", permit("followups:read"), listFollowUps);
followUpRoutes.post("/", permit("followups:create"), createFollowUp);
followUpRoutes.put("/:id", permit("followups:update"), updateFollowUp);
followUpRoutes.delete("/:id", permit("followups:delete"), deleteFollowUp);
