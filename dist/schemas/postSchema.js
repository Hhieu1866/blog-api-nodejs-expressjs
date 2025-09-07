"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
exports.createPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters"),
    content: zod_1.z.string().min(6, "Content must be at least 6 characters"),
    categoryId: zod_1.z.string().optional().nullable(),
    tagIds: zod_1.z.array(zod_1.z.string()).optional(),
    published: zod_1.z.boolean().optional(),
    thumbnailUrl: zod_1.z.string().url().optional(),
});
exports.updatePostSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be at least 3 characters").optional(),
    content: zod_1.z
        .string()
        .min(6, "Content must be at least 6 characters")
        .optional(),
    categoryId: zod_1.z.string().optional().nullable(),
    tagIds: zod_1.z.array(zod_1.z.string()).optional(),
    published: zod_1.z.boolean().optional(),
    thumbnailUrl: zod_1.z.string().url().optional(),
});
