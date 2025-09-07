"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/adminUserRoutes.ts
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const postController_1 = require("../controllers/postController");
const router = (0, express_1.Router)();
// Kết quả: GET /api/admin/posts
router.get("/posts", authMiddleware_1.authenticateToken, authMiddleware_1.requireAdmin, postController_1.getAdminPosts);
exports.default = router;
