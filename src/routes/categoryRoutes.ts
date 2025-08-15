import {
  getCategories,
  createCategory,
} from "../controllers/categoryController";
import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getCategories);
router.post("/", authenticateToken, createCategory);

export default router;
