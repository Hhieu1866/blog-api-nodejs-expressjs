"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const authenticateToken = (req, res, next) => {
    // lay token tu header authorization, bearer token
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token)
            return res.status(401).json({ message: "Access token missing" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Get user with role
        prisma_1.default.user.findUnique({
            where: { id: decoded.uid },
            select: { id: true, email: true, name: true, role: true }
        }).then(user => {
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            req.user = user;
            next();
        }).catch(() => {
            return res.status(401).json({ message: "Invalid token" });
        });
    }
    catch (error) {
        return res.status(403).json({ message: "Invalid token" });
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
