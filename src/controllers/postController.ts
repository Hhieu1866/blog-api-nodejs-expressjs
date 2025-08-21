// src/controllers/postController.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createPostSchema, updatePostSchema } from "../schemas/postSchema";

// GET - /api/posts (pagination + search + filter by cate)
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 6, search = "", category, authorId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
    if (authorId) {
      where.authorId = String(authorId);
    }

    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" } },
        { content: { contains: String(search), mode: "insensitive" } },
      ];
    }
    if (category) {
      where.category = { name: String(category) };
    }

    const posts = await prisma.post.findMany({
      skip,
      take,
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.post.count({ where });

    res.json({
      message: "Posts retrieved successfully",
      data: posts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to retrieve posts due to server error.",
      error: error.message,
    });
  }
};

// GET - /api/posts/:id
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: true,
        comments: {
          include: {
            author: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json({ message: "Post retrieved successfully", post });
  } catch (error: any) {
    if (error.code === "P2023") {
      return res.status(400).json({ message: "Invalid post ID format" });
    }
    res.status(500).json({
      message: "Failed to retrieve post due to server error.",
      error: error.message,
    });
  }
};

// POST - /api/posts
export const createPost = async (req: Request, res: Response) => {
  try {
    // Validation
    const validationResult = createPostSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.format(),
      });
    }

    const { title, content, categoryId, tagIds, published } =
      validationResult.data;
    const userId = (req as any).user.uid;

    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        published: published ?? true,
        authorId: userId,
        categoryId,
        tags: tagIds
          ? { connect: tagIds.map((id: string) => ({ id })) }
          : undefined,
      },
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Post with this title already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Category or tag not found" });
    }
    res.status(500).json({
      message: "Failed to create post due to server error.",
      error: error.message,
    });
  }
};

// PUT - /api/posts/:id
export const updatePost = async (req: Request, res: Response) => {
  try {
    // Validation
    const validationResult = updatePostSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.format(),
      });
    }

    const { id } = req.params;
    const userId = (req as any).user.uid;
    const data = validationResult.data;

    // Check authorization
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (existingPost.authorId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this post" });
    }

    // Prepare update data
    const updateData: any = { ...data };
    if (data.title) {
      updateData.slug = data.title.toLowerCase().replace(/\s+/g, "-");
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    res.json({ message: "Post updated successfully", post: updatedPost });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Post not found" });
    }
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Post with this title already exists" });
    }
    res.status(500).json({
      message: "Failed to update post due to server error.",
      error: error.message,
    });
  }
};

// DELETE - /api/posts/:id
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.uid;

    // Check authorization
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this post" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.json({ message: "Post deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).json({
      message: "Failed to delete post due to server error.",
      error: error.message,
    });
  }
};
