"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Manage blog posts
 */
/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Retrieve all posts (with pagination, search, and category filter)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of posts per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category name to filter
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *       500:
 *         description: Failed to retrieve posts due to server error.
 */
router.get("/", postController_1.getPosts);
/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Retrieve post details by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Failed to retrieve post due to server error.
 */
router.get("/:id", postController_1.getPostById);
/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 example: My First Post
 *               content:
 *                 type: string
 *                 example: This is the content of the post.
 *               categoryId:
 *                 type: string
 *                 example: 123
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tag1", "tag2"]
 *     responses:
 *       201:
 *         description: Post created successfully
 *       500:
 *         description: Failed to create post due to server error.
 */
router.post("/", authMiddleware_1.authenticateToken, postController_1.createPost);
/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Post Title
 *               content:
 *                 type: string
 *                 example: Updated post content.
 *               categoryId:
 *                 type: string
 *                 example: 123
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tag1", "tag2"]
 *               published:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       500:
 *         description: Failed to update post due to server error.
 */
router.put("/:id", authMiddleware_1.authenticateToken, postController_1.updatePost);
/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       500:
 *         description: Failed to delete post due to server error.
 */
router.delete("/:id", authMiddleware_1.authenticateToken, postController_1.deletePost);
exports.default = router;
