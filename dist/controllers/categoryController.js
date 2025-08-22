"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.getCategories = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// GET - /api/categories
const getCategories = async (req, res) => {
    try {
        const categories = await prisma_1.default.category.findMany();
        res.json({ message: "Categories retrieved successfully", categories });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve categories due to server error.", error: error.message });
    }
};
exports.getCategories = getCategories;
// POST - /api/categories
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ message: "Category name is required" });
        const newCategory = await prisma_1.default.category.create({
            data: { name },
        });
        res.status(201).json({ message: "Category created successfully", category: newCategory });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create category due to server error.", error: error.message });
    }
};
exports.createCategory = createCategory;
