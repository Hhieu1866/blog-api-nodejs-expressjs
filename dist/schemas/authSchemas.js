"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email" }),
    name: zod_1.z.string().min(1, { message: "Name is required" }),
    password: zod_1.z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email" }),
    password: zod_1.z.string().min(1, { message: "Password is required" }),
});
