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
      data: { email, name, password: hashedPassword },
    });

    const tokens = genTokens(user.id);
    res.status(201).json({ user, ...tokens });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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

    res.json({ user, ...tokens });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST - /api/auth/refresh
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(401).json({ message: "Refresh token missing" });

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    );

    const tokens = genTokens(decoded.uid);

    res.json(tokens);
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

// POST - /api/auth/logout
export async function logout(_req: Request, res: Response) {
  res.json({ message: "Logged out successfully" });
}
