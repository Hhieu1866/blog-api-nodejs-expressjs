"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(255, "Title too long"),
    content: zod_1.z.string().min(1, "Content is required"),
    categoryId: zod_1.z.string().optional(),
    tagIds: zod_1.z.array(zod_1.z.string()).optional(),
    published: zod_1.z.boolean().optional().default(true),
});
exports.updatePostSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Title is required")
        .max(255, "Title too long")
        .optional(),
    content: zod_1.z.string().min(1, "Content is required").optional(),
    categoryId: zod_1.z.string().optional(),
    tagIds: zod_1.z.array(zod_1.z.string()).optional(),
    published: zod_1.z.boolean().optional(),
});
