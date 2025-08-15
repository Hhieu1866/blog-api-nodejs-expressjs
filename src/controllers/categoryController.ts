import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET - /api/categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST - /api/categories
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json("name is required");

    const newCategory = await prisma.category.create({
      data: { name },
    });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
