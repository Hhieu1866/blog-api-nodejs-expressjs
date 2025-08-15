import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";

// export const  = async (req: Request, res: Response) => {}

// GET - /api/users/:id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User retrieved successfully", user });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to retrieve user due to server error.", error: error.message });
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
    res.status(500).json({ message: "Failed to update user due to server error.", error: error.message });
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
    res.status(500).json({ message: "Failed to delete user due to server error.", error: error.message });
  }
};
