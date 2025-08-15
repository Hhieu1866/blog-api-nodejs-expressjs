import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET - /api/posts/:postId/comments
export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
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

    res.json({ message: "Comments retrieved successfully", comments });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to retrieve comments due to server error.", error: error.message });
  }
};

// POST - /api/posts/:postId/comments
export const createComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content)
      return res.status(400).json({ message: "Comment content is required" });

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: (req as any).user.id,
      },
    });

    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create comment due to server error.", error: error.message });
  }
};

// PUT - /api/comments/:id
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content)
      return res.status(400).json({ message: "Comment content is required" });

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
    });

    res.json({ message: "Comment updated successfully", comment: updatedComment });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update comment due to server error.", error: error.message });
  }
};

// DELETE - /api/comments/:id
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.comment.delete({
      where: { id },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete comment due to server error.", error: error.message });
  }
};

