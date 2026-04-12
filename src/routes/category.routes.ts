import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getImagesByCategory,
} from "../controllers/category.controller";

const router = Router();

router.use(protect);

router.get("/", getCategories);
router.post("/", createCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.get("/:id/images", getImagesByCategory);

export default router;
