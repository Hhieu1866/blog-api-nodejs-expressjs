"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.login = exports.register = void 0;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const genTokens = (uid) => {
    const access = jsonwebtoken_1.default.sign({ uid }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    const refresh = jsonwebtoken_1.default.sign({ uid }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
    return { access, refresh };
};
// POST - /api/auth/register
const register = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const exists = await prisma_1.default.user.findUnique({ where: { email } });
        if (exists)
            return res.status(400).json({ message: "Email already exists" });
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
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
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to register user due to server error.",
            error: error.message,
        });
    }
};
exports.register = register;
// POST - /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({ message: "Invalid email or password" });
        const match = await bcrypt_1.default.compare(password, user.password);
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
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Failed to log in due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.login = login;
// POST - /api/auth/refresh
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token)
            return res.status(401).json({ message: "Refresh token is missing" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
        // verify user still exists
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.uid },
            select: { id: true },
        });
        if (!user)
            return res.status(401).json({ message: "User not found" });
        const tokens = genTokens(decoded.uid);
        res.json({ message: "Access token refreshed successfully", ...tokens });
    }
    catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Refresh token expired" });
        }
        console.error("Refresh token error:", error);
        res.status(500).json({
            message: "Failed to refresh token due to server error",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
exports.refreshToken = refreshToken;
// POST - /api/auth/logout
async function logout(req, res) {
    try {
        res.json({ message: "User logged out successfully" });
    }
    catch (error) {
        console.error("Logout error: ", error);
        res.status(500).json({ message: "Failed to logout due to server error" });
        error: process.env.NODE_ENV === "development" ? error.message : undefined;
    }
}
