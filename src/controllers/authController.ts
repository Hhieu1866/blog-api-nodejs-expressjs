import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";

const genTokens = (uid: string) => {
  const access = jwt.sign({ uid }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
  const refresh = jwt.sign({ uid }, process.env.JWT_REFRESH_SECRET as string, {
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
        role: "USER",
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
    res.status(500).json({
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

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      message: "User logged in successfully",
      user: userWithoutPassword,
      ...tokens,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Failed to log in due to server error",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
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

    // verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.uid },
      select: { id: true },
    });

    if (!user) return res.status(401).json({ message: "User not found" });

    const tokens = genTokens(decoded.uid);

    res.json({ message: "Access token refreshed successfully", ...tokens });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Refresh token expired" });
    }

    console.error("Refresh token error:", error);
    res.status(500).json({
      message: "Failed to refresh token due to server error",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// POST - /api/auth/logout
export async function logout(req: Request, res: Response) {
  try {
    res.json({ message: "User logged out successfully" });
  } catch (error: any) {
    console.error("Logout error: ", error);
    res.status(500).json({ message: "Failed to logout due to server error" });
    error: process.env.NODE_ENV === "development" ? error.message : undefined;
  }
}
