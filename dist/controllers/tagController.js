"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTag = exports.getTags = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// GET - /api/tags
const getTags = async (req, res) => {
    try {
        const tags = await prisma_1.default.tag.findMany();
        res.json({ message: "Tags retrieved successfully", tags });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve tags due to server error.", error: error.message });
    }
};
exports.getTags = getTags;
const createTag = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ message: "Tag name is required" });
        const newTag = await prisma_1.default.tag.create({
            data: { name },
        });
        res.status(201).json({ message: "Tag created successfully", tag: newTag });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create tag due to server error.", error: error.message });
    }
};
exports.createTag = createTag;
