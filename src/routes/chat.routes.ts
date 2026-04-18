import { Router } from "express";
import {
  askChat,
  askFeedback,
  askWriteEvaluation,
} from "../controllers/chat.controller";

const router = Router();

// POST /api/chat/ask
router.post("/ask", askChat);
router.post("/feedback", askFeedback);
router.post("/write-evaluate", askWriteEvaluation);

export default router;
