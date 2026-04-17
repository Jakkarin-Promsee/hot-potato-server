import { Router } from "express";
import { askChat } from "../controllers/chat.controller";

const router = Router();

// POST /api/chat/ask
router.post("/ask", askChat);

export default router;
