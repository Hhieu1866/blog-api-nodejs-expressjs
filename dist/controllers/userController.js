"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// export const  = async (req: Request, res: Response) => {}
// GET - /api/users/:id
const getUserById = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await prisma_1.default.user.findUnique({
            where: { id },
            select: { id: true, email: true, name: true, createdAt: true },
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "User retrieved successfully", user });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve user due to server error.", error: error.message });
    }
};
exports.getUserById = getUserById;
// PUT - /api/users/:id
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, password } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (password) {
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            updateData.password = hashedPassword;
        }
        const updated = await prisma_1.default.user.update({
            where: { id },
            data: updateData,
            select: { id: true, email: true, name: true, createdAt: true },
        });
        res.json({ message: "User updated successfully", user: updated });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update user due to server error.", error: error.message });
    }
};
exports.updateUser = updateUser;
// DELETE - /api/users/:id
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.user.delete({
            where: { id },
        });
        res.json({ message: "User deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete user due to server error.", error: error.message });
    }
};
exports.deleteUser = deleteUser;
