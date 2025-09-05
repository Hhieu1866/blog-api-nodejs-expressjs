import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";

// GET - /api/users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role,
      hasPosts,
      createdFrom,
      createdTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as Record<string, string>;

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip =
      Number.isFinite(pageNum) && pageNum > 0 ? (pageNum - 1) * limitNum : 0;
    const take = Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 10;

    const where: any = {};

    // Search filter - include email search
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Role filter
    if (role === "ADMIN" || role === "USER") {
      where.role = role;
    }

    // Posts filter - FIXED: hasPosts logic was wrong
    if (hasPosts === "true") {
      where.posts = { some: {} }; // Has at least one post
    }
    if (hasPosts === "false") {
      where.posts = { none: {} }; // Has no posts
    }

    // Date range filter
    if (createdFrom || createdTo) {
      where.createdAt = {};
      const from = createdFrom ? new Date(createdFrom) : null;
      const to = createdTo ? new Date(createdTo) : null;

      if (from && !isNaN(from.getTime())) {
        where.createdAt.gte = from;
      }
      if (to && !isNaN(to.getTime())) {
        // Add end of day to include full day
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endOfDay;
      }
    }

    // Sort logic - FIXED: typos in sort direction
    const direction = sortOrder === "asc" ? "asc" : "desc"; // Fixed "acs" typo
    let orderBy: any = { createdAt: direction };

    if (sortBy === "name" || sortBy === "email" || sortBy === "createdAt") {
      orderBy = { [sortBy]: direction };
    } else if (sortBy === "postsCount") {
      orderBy = { posts: { _count: direction } };
    }

    // Fetch users with count
    const users = await prisma.user.findMany({
      skip,
      take,
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { posts: true } },
      },
      orderBy,
    });

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Transform data
    const data = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      postsCount: u._count.posts,
    }));

    // FIXED: Remove duplicate res.json() calls
    res.json({
      message: "Users retrieved successfully",
      data,
      pagination: {
        total,
        page: Math.max(1, pageNum || 1),
        limit: take,
        totalPages: Math.max(1, Math.ceil(total / take)),
      },
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    res.status(500).json({
      message: "Failed to retrieve users due to server error.",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// GET - /api/users/:id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User retrieved successfully", user });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to retrieve user due to server error.",
      error: error.message,
    });
  }
};

// PUT - /api/users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, password } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, createdAt: true },
    });

    res.json({ message: "User updated successfully", user: updated });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update user due to server error.",
      error: error.message,
    });
  }
};

// DELETE - /api/users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete user due to server error.",
      error: error.message,
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // validate current password
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isValidPassword)
      return res
        .status(400)
        .json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    res.json({ message: "Password changed successfully" });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to change password due to server error.",
      error: error.message,
    });
  }
};
