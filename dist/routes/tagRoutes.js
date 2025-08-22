"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tagController_1 = require("../controllers/tagController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
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
router.get("/", tagController_1.getTags);
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
router.post("/", authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, tagController_1.createTag);
exports.default = router;
