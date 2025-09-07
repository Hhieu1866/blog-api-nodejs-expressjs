// src/controllers/tagController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createTagSchema } from "../schemas/tagSchema";

// GET - /api/tags
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
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
  } catch (error: any) {
    console.error("Get tags error:", error);
    res.status(500).json({
      message: "Failed to retrieve tags due to server error",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// POST - /api/tags (Admin only)
export const createTag = async (req: Request, res: Response) => {
  try {
    // Validation
    const validationResult = createTagSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.format(),
      });
    }

    const { name } = validationResult.data;

    // Check if tag already exists (case insensitive) - FIXED
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });

    // Manual case-insensitive check
    const allTags = await prisma.tag.findMany();
    const existingTagCaseInsensitive = allTags.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );

    if (existingTagCaseInsensitive) {
      return res.status(409).json({
        message: "Tag already exists",
      });
    }

    const newTag = await prisma.tag.create({
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
  } catch (error: any) {
    console.error("Create tag error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Tag already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create tag due to server error",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// PUT - /api/tags/:id (Admin only)
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validation
    const validationResult = createTagSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.format(),
      });
    }

    const { name } = validationResult.data;

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    // Check if new name already exists (case insensitive, excluding current tag) - FIXED
    const allTags = await prisma.tag.findMany({
      where: {
        NOT: { id },
      },
    });

    const duplicateTag = allTags.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicateTag) {
      return res.status(409).json({
        message: "Tag name already exists",
      });
    }

    const updatedTag = await prisma.tag.update({
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
  } catch (error: any) {
    console.error("Update tag error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    res.status(500).json({
      message: "Failed to update tag due to server error",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// DELETE - /api/tags/:id (Admin only)
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if tag exists
    const tag = await prisma.tag.findUnique({
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

    await prisma.tag.delete({
      where: { id },
    });

    res.json({
      message: "Tag deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete tag error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Tag not found",
      });
    }

    res.status(500).json({
      message: "Failed to delete tag due to server error",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
