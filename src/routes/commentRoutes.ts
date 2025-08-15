import { Router } from "express";
import {
  getCommentsByPost,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Manage comments
 */

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   get:
 *     summary: Retrieve all comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       500:
 *         description: Failed to retrieve comments due to server error.
 */
router.get("/posts/:postId/comments", getCommentsByPost);

/**
 * @swagger
 * /api/posts/{postId}/comments:
 *   post:
 *     summary: Create a new comment for a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: This is a comment.
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Comment content is required
 *       500:
 *         description: Failed to create comment due to server error.
 */
router.post("/posts/:postId/comments", authenticateToken, createComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Updated comment content.
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Comment content is required
 *       500:
 *         description: Failed to update comment due to server error.
 */
router.put("/comments/:id", authenticateToken, updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       500:
 *         description: Failed to delete comment due to server error.
 */
router.delete("/comments/:id", authenticateToken, deleteComment);

export default router;
