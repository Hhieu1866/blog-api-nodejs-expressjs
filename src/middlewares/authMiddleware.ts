import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // lay token tu header authorization, bearer token
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Access token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { uid: string };

    // Get user with role
    prisma.user.findUnique({
      where: { id: decoded.uid },
      select: { id: true, email: true, name: true, role: true }
    }).then(user => {
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      (req as any).user = user;
      next();
    }).catch(() => {
      return res.status(401).json({ message: "Invalid token" });
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as any).user;
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
