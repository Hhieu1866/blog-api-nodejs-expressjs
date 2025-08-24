// src/controllers/categoryController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createCategorySchema } from "../schemas/category"; 

// GET - /api/categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: true }, // ✅ Thêm post count
        },
      },
    });

    res.json({
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error: any) {
    console.error("Get categories error:", error);
    res.status(500).json({
      message: "Failed to retrieve categories due to server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// POST - /api/categories (Admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    // ✅ Validation với Zod
    const validationResult = createCategorySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.format(),
      });
    }

    const { name } = validationResult.data;

    // ✅ Check if category already exists (case insensitive)
    const allCategories = await prisma.category.findMany();
    const existingCategory = allCategories.find(
      category => category.name.toLowerCase() === name.toLowerCase()
    );

    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const newCategory = await prisma.category.create({
      data: { name },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    res.status(201).json({
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error: any) {
    console.error("Create category error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create category due to server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// PUT - /api/categories/:id (Admin only) - ✅ THÊM MỚI
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validation
    const validationResult = createCategorySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.format(),
      });
    }

    const { name } = validationResult.data;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Check if new name already exists (excluding current category)
    const allCategories = await prisma.category.findMany({
      where: { NOT: { id } }
    });
    
    const duplicateCategory = allCategories.find(
      category => category.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicateCategory) {
      return res.status(409).json({
        message: "Category name already exists",
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    res.json({
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error: any) {
    console.error("Update category error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(500).json({
      message: "Failed to update category due to server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// DELETE - /api/categories/:id (Admin only) - ✅ THÊM MỚI
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Prevent deletion if category has posts
    if (category._count.posts > 0) {
      return res.status(400).json({
        message: "Cannot delete category that is being used by posts",
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete category error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(500).json({
      message: "Failed to delete category due to server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};