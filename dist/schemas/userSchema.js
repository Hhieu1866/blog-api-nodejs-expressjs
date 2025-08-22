"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = void 0;
const zod_1 = require("zod");
exports.updateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: "Invalid email" }).optional(),
    name: zod_1.z.string().min(1, { message: "Name is required" }).optional(),
    password: zod_1.z
        .string()
        .min(6, { message: "Password must be at least 6 characters" })
        .optional(),
});
