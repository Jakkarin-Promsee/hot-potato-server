import { Router } from "express";
import { getUsers, createUser } from "../controllers/user.controller";
import { protect, restrictTo } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", protect, getUsers);
router.post("/", createUser);

export default router;
