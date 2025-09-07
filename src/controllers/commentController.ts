import { Request, Response } from "express";
import prisma from "../config/prisma";

// GET - /api/posts/:postId/comments
export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ message: "Comments retrieved successfully", comments });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to retrieve comments due to server error.",
      error: error.message,
    });
  }
};

// POST - /api/posts/:postId/comments
export const createComment = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;

    if (!content?.trim())
      return res.status(400).json({ message: "Comment content is required" });

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment) {
        return res.status(400).json({ message: "Parent comment not found" });
      }
      if (parentComment.postId !== postId) {
        return res.status(400).json({ message: "Invalid parent comment" });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: (req as any).user.id,
        parentId: parentId || null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create comment due to server error.",
      error: error.message,
    });
  }
};

// PUT - /api/comments/:id
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim())
      return res.status(400).json({ message: "Comment content is required" });

    const actorId = (req as any).user?.id;
    const actorRole = (req as any).user?.role;

    const existing = await prisma.comment.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
    if (!existing)
      return res.status(404).json({ message: "Comment not found" });

    const isOwner = existing.authorId === actorId;
    const isAdmin = actorRole === "ADMIN";
    if (!isOwner && !isAdmin)
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this comment" });

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update comment due to server error.",
      error: error.message,
    });
  }
};

// DELETE - /api/comments/:id
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const actorId = (req as any).user?.id;
    const actorRole = (req as any).user?.role;

    const existing = await prisma.comment.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
    if (!existing)
      return res.status(404).json({ message: "Comment not found" });

    const isOwner = existing.authorId === actorId;
    const isAdmin = actorRole === "ADMIN";
    if (!isOwner && !isAdmin)
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this comment" });

    await prisma.comment.delete({ where: { id } });
    res.json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete comment due to server error.",
      error: error.message,
    });
  }
};
