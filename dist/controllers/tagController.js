"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.updateTag = exports.createTag = exports.getTags = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const tagSchema_1 = require("../schemas/tagSchema");
// GET - /api/tags
const getTags = async (req, res) => {
    try {
        const tags = await prisma_1.default.tag.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { posts: true }, // Include count of posts for each tag
                },
            },
        });
        res.json({
            message: "Tags retrieved successfully",
            data: tags,
        });
    }
    catch (error) {
        console.error("Get tags error:", error);
        res.status(500).json({
            message: "Failed to retrieve tags due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.getTags = getTags;
// POST - /api/tags (Admin only)
const createTag = async (req, res) => {
    try {
        // Validation
        const validationResult = tagSchema_1.createTagSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.format(),
            });
        }
        const { name } = validationResult.data;
        // Check if tag already exists (case insensitive) - FIXED
        const existingTag = await prisma_1.default.tag.findFirst({
            where: {
                name: {
                    equals: name,
                    // mode: "insensitive", // Remove this line
                },
            },
        });
        // Manual case-insensitive check
        const allTags = await prisma_1.default.tag.findMany();
        const existingTagCaseInsensitive = allTags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
        if (existingTagCaseInsensitive) {
            return res.status(409).json({
                message: "Tag already exists",
            });
        }
        const newTag = await prisma_1.default.tag.create({
            data: { name },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
        res.status(201).json({
            message: "Tag created successfully",
            data: newTag,
        });
    }
    catch (error) {
        console.error("Create tag error:", error);
        if (error.code === "P2002") {
            return res.status(409).json({
                message: "Tag already exists",
            });
        }
        res.status(500).json({
            message: "Failed to create tag due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.createTag = createTag;
// PUT - /api/tags/:id (Admin only)
const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        // Validation
        const validationResult = tagSchema_1.createTagSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationResult.error.format(),
            });
        }
        const { name } = validationResult.data;
        // Check if tag exists
        const existingTag = await prisma_1.default.tag.findUnique({
            where: { id },
        });
        if (!existingTag) {
            return res.status(404).json({
                message: "Tag not found",
            });
        }
        // Check if new name already exists (case insensitive, excluding current tag) - FIXED
        const allTags = await prisma_1.default.tag.findMany({
            where: {
                NOT: { id }
            }
        });
        const duplicateTag = allTags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
        if (duplicateTag) {
            return res.status(409).json({
                message: "Tag name already exists",
            });
        }
        const updatedTag = await prisma_1.default.tag.update({
            where: { id },
            data: { name },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
        res.json({
            message: "Tag updated successfully",
            data: updatedTag,
        });
    }
    catch (error) {
        console.error("Update tag error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({
                message: "Tag not found",
            });
        }
        res.status(500).json({
            message: "Failed to update tag due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.updateTag = updateTag;
// DELETE - /api/tags/:id (Admin only)
const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if tag exists
        const tag = await prisma_1.default.tag.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });
        if (!tag) {
            return res.status(404).json({
                message: "Tag not found",
            });
        }
        // Optional: Prevent deletion if tag has posts
        if (tag._count.posts > 0) {
            return res.status(400).json({
                message: "Cannot delete tag that is being used by posts",
            });
        }
        await prisma_1.default.tag.delete({
            where: { id },
        });
        res.json({
            message: "Tag deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete tag error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({
                message: "Tag not found",
            });
        }
        res.status(500).json({
            message: "Failed to delete tag due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.deleteTag = deleteTag;
