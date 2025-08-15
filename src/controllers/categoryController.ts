import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET - /api/categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    res.json({ message: "Categories retrieved successfully", categories });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to retrieve categories due to server error.", error: error.message });
  }
};

// POST - /api/categories
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const newCategory = await prisma.category.create({
      data: { name },
    });

    res.status(201).json({ message: "Category created successfully", category: newCategory });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create category due to server error.", error: error.message });
  }
};
