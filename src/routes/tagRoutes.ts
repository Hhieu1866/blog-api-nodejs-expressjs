import { Router } from "express";
import { getTags, createTag } from "../controllers/tagController";
import { authenticateToken, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Manage post tags
 */

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Retrieve all tags
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *       500:
 *         description: Failed to retrieve tags due to server error.
 */
router.get("/", getTags);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: JavaScript
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Tag name is required
 *       403:
 *         description: Admin access required
 *       500:
 *         description: Failed to create tag due to server error.
 */
router.post("/", authenticateToken, requireAdmin, createTag);

export default router;
