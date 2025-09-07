"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateComment = exports.createComment = exports.getCommentsByPost = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// GET - /api/posts/:postId/comments
const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await prisma_1.default.comment.findMany({
            where: { postId },
            include: {
                author: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ message: "Comments retrieved successfully", comments });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to retrieve comments due to server error.",
            error: error.message,
        });
    }
};
exports.getCommentsByPost = getCommentsByPost;
// POST - /api/posts/:postId/comments
const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, parentId } = req.body;
        if (!content?.trim())
            return res.status(400).json({ message: "Comment content is required" });
        if (parentId) {
            const parentComment = await prisma_1.default.comment.findUnique({
                where: { id: parentId },
            });
            if (!parentComment) {
                return res.status(400).json({ message: "Parent comment not found" });
            }
            if (parentComment.postId !== postId) {
                return res.status(400).json({ message: "Invalid parent comment" });
            }
        }
        const comment = await prisma_1.default.comment.create({
            data: {
                content: content.trim(),
                postId,
                authorId: req.user.id,
                parentId: parentId || null,
            },
            include: {
                author: { select: { id: true, name: true, email: true } },
            },
        });
        res.status(201).json({ message: "Comment created successfully", comment });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to create comment due to server error.",
            error: error.message,
        });
    }
};
exports.createComment = createComment;
// PUT - /api/comments/:id
const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!content?.trim())
            return res.status(400).json({ message: "Comment content is required" });
        const actorId = req.user?.id;
        const actorRole = req.user?.role;
        const existing = await prisma_1.default.comment.findUnique({
            where: { id },
            select: { id: true, authorId: true },
        });
        if (!existing)
            return res.status(404).json({ message: "Comment not found" });
        const isOwner = existing.authorId === actorId;
        const isAdmin = actorRole === "ADMIN";
        if (!isOwner && !isAdmin)
            return res
                .status(403)
                .json({ message: "You are not allowed to edit this comment" });
        const updatedComment = await prisma_1.default.comment.update({
            where: { id },
            data: { content: content.trim() },
            include: {
                author: { select: { id: true, name: true, email: true } },
            },
        });
        res.json({
            message: "Comment updated successfully",
            comment: updatedComment,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to update comment due to server error.",
            error: error.message,
        });
    }
};
exports.updateComment = updateComment;
// DELETE - /api/comments/:id
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const actorId = req.user?.id;
        const actorRole = req.user?.role;
        const existing = await prisma_1.default.comment.findUnique({
            where: { id },
            select: { id: true, authorId: true },
        });
        if (!existing)
            return res.status(404).json({ message: "Comment not found" });
        const isOwner = existing.authorId === actorId;
        const isAdmin = actorRole === "ADMIN";
        if (!isOwner && !isAdmin)
            return res
                .status(403)
                .json({ message: "You are not allowed to delete this comment" });
        await prisma_1.default.comment.delete({ where: { id } });
        res.json({ message: "Comment deleted successfully" });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to delete comment due to server error.",
            error: error.message,
        });
    }
};
exports.deleteComment = deleteComment;
