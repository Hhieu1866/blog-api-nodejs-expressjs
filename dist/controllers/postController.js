"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.createPost = exports.getPostById = exports.getPosts = void 0;
exports.updatePost = updatePost;
const prisma_1 = __importDefault(require("../config/prisma"));
// GET - /api/posts (pagination + search + filter by cate)
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", category } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);
        const where = {};
        if (search) {
            where.OR = [
                { title: { contains: String(search), mode: "insensitive" } },
                { content: { contains: String(search), mode: "insensitive" } },
            ];
        }
        if (category) {
            where.category = { name: String(category) };
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
            orderBy: { createdAt: "desc" },
        });
        const total = await prisma_1.default.post.count({ where });
        res.json({
            message: "Posts retrieved successfully",
            data: posts,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve posts due to server error.", error: error.message });
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
                    include: {
                        author: { select: { id: true, name: true } },
                    },
                },
            },
        });
        if (!post)
            return res.status(404).json({ message: "Post not found" });
        res.json({ message: "Post retrieved successfully", post });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve post due to server error.", error: error.message });
    }
};
exports.getPostById = getPostById;
// POST - /api/posts
const createPost = async (req, res) => {
    try {
        const { title, content, categoryId, tagIds } = req.body;
        const userId = req.user.uid; // lấy userId từ JWT
        const slug = title.toLowerCase().replace(/\s+/g, "-");
        const post = await prisma_1.default.post.create({
            data: {
                title,
                slug,
                content,
                published: true,
                authorId: userId,
                categoryId,
                tags: tagIds
                    ? { connect: tagIds.map((id) => ({ id })) }
                    : undefined,
            },
        });
        res.status(201).json({ message: "Post created successfully", post });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create post due to server error.", error: error.message });
    }
};
exports.createPost = createPost;
// PUT - /api/posts/:id
async function updatePost(req, res) {
    try {
        const { id } = req.params;
        const { title, content, categoryId, tagIds, published } = req.body;
        const data = {};
        if (title) {
            data.title = title;
            data.slug = title.toLowerCase().replace(/\s+/g, "-");
        }
        if (content)
            data.content = content;
        if (typeof published === "boolean")
            data.published = published;
        if (categoryId)
            data.categoryId = categoryId;
        if (tagIds) {
            data.tags = {
                set: [], // xóa liên kết tag cũ
                connect: tagIds.map((id) => ({ id })),
            };
        }
        const updated = await prisma_1.default.post.update({
            where: { id },
            data,
        });
        res.json({ message: "Post updated successfully", post: updated });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update post due to server error.", error: error.message });
    }
}
// DELETE - /api/posts/:id
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.post.delete({
            where: { id },
        });
        res.json({ message: "Post deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete post due to server error.", error: error.message });
    }
};
exports.deletePost = deletePost;
