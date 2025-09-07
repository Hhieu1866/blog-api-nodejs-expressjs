"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const authenticateToken = async (req, res, next) => {
    // lay token tu header authorization, bearer token
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token)
            return res.status(401).json({ message: "Access token missing" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Get user from database
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.uid },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user)
            return res.status(401).json({ message: "User not found" });
        req.user = user;
        next(); // Add this line to continue to next middleware
    }
    catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Invalid token" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Token expired" });
        }
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: "Authentication failed" });
    }
};
exports.authenticateToken = authenticateToken;
// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== "ADMIN") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};
exports.requireAdmin = requireAdmin;
