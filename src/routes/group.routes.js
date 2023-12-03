import { Router } from "express";

import * as GroupController from "../controller/group.controller.js";
import { requireAuth } from "../middleware/validateToken.js";
import { validateId } from "../middleware/ajvValidation.js";

const groupRouter = Router();

// Group Routes
groupRouter.post("/:id", validateId, requireAuth, GroupController.createGroup);
groupRouter.put("/member", requireAuth, GroupController.pushUserToGroup);
groupRouter.get("/user/groups", requireAuth, GroupController.getGroupsByUser);
groupRouter.patch("/:id", validateId, requireAuth, GroupController.updateGroup); // Requires admin permission
groupRouter.delete(
  "/:id",
  validateId,
  requireAuth,
  GroupController.deleteGroup
); // Requires admin permission

export default groupRouter;
