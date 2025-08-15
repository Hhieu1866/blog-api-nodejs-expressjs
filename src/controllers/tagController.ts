import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET - /api/tags
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany();

    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json("name is required");

    const newTag = await prisma.tag.create({
      data: { name },
    });

    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
