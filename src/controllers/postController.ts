import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET - /api/posts (pagination + search + filter by cate)
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "", category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: any = {};
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
      data: posts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET - /api/posts/:id
export const getPost = async (req: Request, res: Response) => {
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

    if (!post) return res.status(404).json({ message: "post not found" });

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST - /api/posts
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, categoryId, tagIds } = req.body;
    const userId = (req as any).user.uid; // lấy userId từ JWT

    const slug = title.toLowerCase().replace(/\s+/g, "-");

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        published: true,
        authorId: userId,
        categoryId,
        tags: tagIds
          ? { connect: tagIds.map((id: string) => ({ id })) }
          : undefined,
      },
    });

    res.status(201).json(post);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT - /api/posts/:id
export async function updatePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, content, categoryId, tagIds, published } = req.body;

    const data: any = {};
    if (title) {
      data.title = title;
      data.slug = title.toLowerCase().replace(/\s+/g, "-");
    }
    if (content) data.content = content;
    if (typeof published === "boolean") data.published = published;
    if (categoryId) data.categoryId = categoryId;
    if (tagIds) {
      data.tags = {
        set: [], // xóa liên kết tag cũ
        connect: tagIds.map((id: string) => ({ id })),
      };
    }

    const updated = await prisma.post.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE - /api/posts/:id
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.post.delete({
      where: { id },
    });

    res.json({ message: "post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
