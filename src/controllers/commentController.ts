import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET - /api/posts/:postId/comments
export const getCommentByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const comments = prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST - /api/posts/:postId/comments
export const createComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: (req as any).user.id,
      },
    });

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT - /api/comments/:id
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE - /api/comments/:id
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.comment.delete({
      where: { id },
    });

    res.json({ message: "comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

