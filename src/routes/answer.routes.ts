import { Router } from "express";
import {
  bulkSaveAnswers,
  getAnswers,
  saveAnswer,
} from "../controllers/answer.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:contentId", protect, getAnswers);
router.put("/:contentId", protect, saveAnswer);
router.put("/:contentId/bulk", protect, bulkSaveAnswers);

export default router;
