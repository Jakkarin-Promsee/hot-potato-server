import { Router } from "express";
import { askChat, askFeedback } from "../controllers/chat.controller";

const router = Router();

// POST /api/chat/ask
router.post("/ask", askChat);
router.post("/feedback", askFeedback);

export default router;
