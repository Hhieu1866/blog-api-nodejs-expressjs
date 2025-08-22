"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Manage post categories
 */
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Retrieve all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       500:
 *         description: Failed to retrieve categories due to server error.
 */
router.get("/", categoryController_1.getCategories);
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
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
 *                 example: Technology
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Category name is required
 *       500:
 *         description: Failed to create category due to server error.
 */
router.post("/", authMiddleware_1.authenticateToken, categoryController_1.createCategory);
exports.default = router;
