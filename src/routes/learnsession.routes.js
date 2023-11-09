import { Router } from "express";

import { requireAuth } from "../middleware/validateToken.js";
import * as LearnSessionController from "../controller/learnsession.controller.js";

const router = Router();

router.post("/:setId", requireAuth, LearnSessionController.createLearnsession);
router.put("/:cardId", requireAuth, LearnSessionController.updateSessionCard);
router.put("/refresh/:sessionId", requireAuth, LearnSessionController.refreshSession);
export default router;