import { Router } from "express";
import {
  createBlankContent,
  updateContent,
  deleteContent,
  searchContent,
  loadContent,
} from "../controllers/content.controller";
import { optionalAuth, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/load", optionalAuth, loadContent);
router.post("/create", protect, createBlankContent);
router.put("/:id", protect, updateContent);
router.delete("/:id", protect, deleteContent);
router.get("/search", optionalAuth, searchContent);

export default router;
