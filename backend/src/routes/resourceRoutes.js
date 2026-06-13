import { Router } from "express";

export function resourceRoutes(controller, permissions) {
  const router = Router();
  router.get("/", permissions.read, controller.list);
  router.get("/:id", permissions.read, controller.get);
  router.post("/", permissions.create, controller.create);
  router.patch("/:id", permissions.update, controller.update);
  router.delete("/:id", permissions.remove, controller.remove);
  return router;
}
