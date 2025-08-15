import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
