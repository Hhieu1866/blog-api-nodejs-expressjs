"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategorySchema = void 0;
// src/schemas/categorySchema.ts
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, { message: "Tag name is required" })
        .max(10, { message: "Tag name too long" }),
});
