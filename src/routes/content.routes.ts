import { Router } from "express";
import {
  createBlankContent,
  updateContent,
  deleteContent,
  searchContent,
  loadContent,
} from "../controllers/content.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/load", protect, loadContent);
router.post("/create", protect, createBlankContent);
router.put("/:id", protect, updateContent);
router.delete("/:id", protect, deleteContent);
router.get("/search", protect, searchContent);

export default router;
