import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";

const genTokens = (uid: string) => {
  const access = jwt.sign({ uid }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
  const refresh = jwt.sign({ uid }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
  return { access, refresh };
};

// POST - /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "USER", // Default role for new registrations
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const tokens = genTokens(user.id);
    res
      .status(201)
      .json({ message: "User registered successfully", user, ...tokens });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: "Failed to register user due to server error.",
        error: error.message,
      });
  }
};

// POST - /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    const tokens = genTokens(user.id);

    res.json({ message: "User logged in successfully", user, ...tokens });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: "Failed to log in due to server error.",
        error: error.message,
      });
  }
};

// POST - /api/auth/refresh
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(401).json({ message: "Refresh token is missing" });

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    );

    const tokens = genTokens(decoded.uid);

    res.json({ message: "Access token refreshed successfully", ...tokens });
  } catch (error: any) {
    res
      .status(403)
      .json({ message: "Invalid refresh token", error: error.message });
  }
};

// POST - /api/auth/logout
export async function logout(_req: Request, res: Response) {
  res.json({ message: "User logged out successfully" });
}
