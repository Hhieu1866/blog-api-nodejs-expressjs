import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET - /api/tags
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany();
    res.json({ message: "Tags retrieved successfully", tags });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to retrieve tags due to server error.", error: error.message });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Tag name is required" });

    const newTag = await prisma.tag.create({
      data: { name },
    });

    res.status(201).json({ message: "Tag created successfully", tag: newTag });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create tag due to server error.", error: error.message });
  }
};
