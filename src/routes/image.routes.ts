import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getImages,
  saveImage,
  deleteImage,
  clearImages,
} from "../controllers/image.controller";

const router = Router();

// All routes require a valid JWT
router.use(protect);

router.get("/", getImages);
router.post("/", saveImage);
router.delete("/:public_id", deleteImage); // e.g. DELETE /images/folder%2Fmy-photo
router.delete("/", clearImages);

export default router;
