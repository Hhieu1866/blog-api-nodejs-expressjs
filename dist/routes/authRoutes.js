"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and account management
 */
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already exists
 *       500:
 *         description: Failed to register user due to server error.
 */
router.post("/register", authController_1.register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in to an account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Failed to log in due to server error.
 */
router.post("/login", authController_1.login);
/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Get a new access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: <refresh_token>
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       401:
 *         description: Refresh token is missing
 *       403:
 *         description: Invalid refresh token
 *       500:
 *         description: Failed to refresh access token due to server error.
 */
router.post("/refresh", authController_1.refreshToken);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out and remove refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post("/logout", authController_1.logout);
exports.default = router;
