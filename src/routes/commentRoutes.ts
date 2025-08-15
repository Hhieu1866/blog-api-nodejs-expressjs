import {
  getCommentByPost,
  createComment,
  deleteComment,
  updateComment,
} from "../controllers/commentController";
import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/posts/:postId/comments", getCommentByPost);
router.post("/posts/:postId/comments", authenticateToken, createComment);
router.get("/comments/:id", authenticateToken, updateComment);
router.delete("/comments/:id", authenticateToken, deleteComment);

export default router;
