import { Router } from "express";
import { getHistory, recordVisit } from "../controllers/history.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", protect, getHistory);
router.post("/visit/:contentId", protect, recordVisit);

export default router;
