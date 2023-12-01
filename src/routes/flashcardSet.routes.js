import { Router } from "express";

import { requireAuth } from "../middleware/validateToken.js";
import { checkUserAccess } from "../middleware/checkUserAccess.js";
import * as FlashcardSetController from "../controller/flashcardSet.controller.js";

const router = Router();

router.post("/", requireAuth, FlashcardSetController.postNewSet);
router.post(
  "/card/:setId",
  requireAuth,
  checkUserAccess,
  FlashcardSetController.postNewCard
);
router.delete("/card/:cardId", requireAuth, FlashcardSetController.deleteCard);
router.put("/card/:cardId", requireAuth, FlashcardSetController.updateCard);
router.get("/", requireAuth, FlashcardSetController.getSetsByUser);
router.get("/:setId", requireAuth, FlashcardSetController.getOneSetBySetId);
router.delete(
  "/:setId",
  requireAuth,
  checkUserAccess,
  FlashcardSetController.deleteSetAndCards
);
router.put(
  "/:setId",
  requireAuth,
  checkUserAccess,
  FlashcardSetController.updateSetInfo
);
router.get("/public/random", FlashcardSetController.getRandomPublicSets);
router.get("/public/:setId", FlashcardSetController.getOneSetBySetId);

export default router;
