// src/routes/adminUserRoutes.ts
import { Router } from "express";
import {
  authenticateToken,
  requireAdmin,
} from "../middlewares/authMiddleware";
import { getAdminPosts } from "../controllers/postController";

const router = Router();

// Kết quả: GET /api/admin/posts
router.get("/posts", authenticateToken, requireAdmin, getAdminPosts);

export default router;
