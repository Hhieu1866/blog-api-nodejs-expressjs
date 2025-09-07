"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getPostById = exports.getPosts = exports.getAdminPosts = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const postSchema_1 = require("../schemas/postSchema");
const getAdminPosts = async (req, res) => {
    try {
        const { page = 1, limit = 6, search = "", category, authorId, published, sortBy = "createdAt", sortOrder = "desc", } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {};
        if (authorId) {
            where.authorId = String(authorId);
        }
        if (published !== undefined) {
            where.published = published === "true";
        }
        if (search) {
            where.OR = [
                { title: { contains: String(search) } },
                { content: { contains: String(search) } },
            ];
        }
        if (category) {
            where.category = {
                name: { contains: String(category) },
            };
        }
        if (req.query.categoryId) {
            where.categoryId = String(req.query.categoryId);
        }
        const posts = await prisma_1.default.post.findMany({
            skip,
            take,
            where,
            include: {
                author: { select: { id: true, name: true, email: true } },
                category: true,
                tags: true,
            },
            orderBy: { [String(sortBy)]: String(sortOrder) },
        });
        const total = await prisma_1.default.post.count({ where });
        res.json({
            message: "Posts retrieved successfully",
            data: posts,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get posts error:", error);
        res.status(500).json({
            message: "Failed to retrieve posts due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.getAdminPosts = getAdminPosts;
// GET - /api/posts (pagination + search + filter by category, author, published status)
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 6, search = "", category, authorId, published, sortBy = "createdAt", sortOrder = "desc", } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {};
        if (authorId) {
            where.authorId = String(authorId);
        }
        if (published !== undefined) {
            where.published = published === "true";
        }
        if (search) {
            where.OR = [
                { title: { contains: String(search) } },
                { content: { contains: String(search) } },
            ];
        }
        if (category) {
            where.category = {
                name: { contains: String(category) },
            };
        }
        if (req.query.categoryId) {
            where.categoryId = String(req.query.categoryId);
        }
        const posts = await prisma_1.default.post.findMany({
            skip,
            take,
            where,
            include: {
                author: { select: { id: true, name: true, email: true } },
                category: true,
                tags: true,
            },
            orderBy: { [String(sortBy)]: String(sortOrder) },
        });
        const total = await prisma_1.default.post.count({ where });
        res.json({
            message: "Posts retrieved successfully",
            data: posts,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error("Get posts error:", error);
        res.status(500).json({
            message: "Failed to retrieve posts due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.getPosts = getPosts;
// GET - /api/posts/:id
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await prisma_1.default.post.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, email: true } },
                category: true,
                tags: true,
                comments: {
                    include: { author: { select: { id: true, name: true } } },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json({ message: "Post retrieved successfully", data: post });
    }
    catch (error) {
        console.error("Get post error:", error);
        if (error.code === "P2023") {
            return res.status(400).json({ message: "Invalid post ID format" });
        }
        res.status(500).json({
            message: "Failed to retrieve post due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.getPostById = getPostById;
// POST - /api/posts
const createPost = async (req, res) => {
    try {
        // Validate body (JSON, từ FE đã upload Cloudinary xong và gửi thumbnailUrl)
        const validationResult = postSchema_1.createPostSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.format(),
            });
        }
        const { title, content, categoryId, tagIds, published, thumbnailUrl } = validationResult.data;
        const userId = req.user.id;
        // Generate slug
        const slug = title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
        const post = await prisma_1.default.post.create({
            data: {
                title,
                slug,
                content,
                published: published ?? true,
                authorId: userId,
                categoryId: categoryId || null,
                thumbnailUrl,
                tags: tagIds
                    ? {
                        connect: tagIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
            include: {
                author: { select: { id: true, name: true, email: true } },
                category: true,
                tags: true,
            },
        });
        res.status(201).json({
            message: "Post created successfully",
            data: post,
        });
    }
    catch (error) {
        console.error("Create post error:", error);
        if (error.code === "P2002") {
            return res
                .status(409)
                .json({ message: "Post with this title already exists" });
        }
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Category or tag not found" });
        }
        res.status(500).json({
            message: "Failed to create post due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.createPost = createPost;
// PUT - /api/posts/:id
const updatePost = async (req, res) => {
    try {
        const validationResult = postSchema_1.updatePostSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.format(),
            });
        }
        const { id } = req.params;
        const userId = req.user.id;
        const data = validationResult.data;
        // Check ownership
        const existingPost = await prisma_1.default.post.findUnique({
            where: { id },
            select: { authorId: true },
        });
        if (!existingPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (existingPost.authorId !== userId) {
            return res
                .status(403)
                .json({ message: "Unauthorized to update this post" });
        }
        // Prepare update
        const updateData = { ...data };
        // handle tagIds separately
        const tagIds = updateData.tagIds;
        delete updateData.tagIds;
        // update slug if title changes
        if (data.title) {
            updateData.slug = data.title
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");
        }
        // tags set
        if (Array.isArray(tagIds)) {
            updateData.tags = { set: tagIds.map((id) => ({ id })) };
        }
        const updatedPost = await prisma_1.default.post.update({
            where: { id },
            data: updateData, // may include thumbnailUrl
            include: {
                author: { select: { id: true, name: true, email: true } },
                category: true,
                tags: true,
            },
        });
        res.json({ message: "Post updated successfully", data: updatedPost });
    }
    catch (error) {
        console.error("Update post error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Post not found" });
        }
        if (error.code === "P2002") {
            return res
                .status(409)
                .json({ message: "Post with this title already exists" });
        }
        res.status(500).json({
            message: "Failed to update post due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.updatePost = updatePost;
// DELETE - /api/posts/:id
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const post = await prisma_1.default.post.findUnique({
            where: { id },
            select: { authorId: true },
        });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.authorId !== userId) {
            return res
                .status(403)
                .json({ message: "Unauthorized to delete this post" });
        }
        await prisma_1.default.post.delete({ where: { id } });
        res.json({ message: "Post deleted successfully" });
    }
    catch (error) {
        console.error("Delete post error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(500).json({
            message: "Failed to delete post due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.deletePost = deletePost;
