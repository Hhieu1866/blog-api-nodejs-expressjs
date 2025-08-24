// src/schemas/categorySchema.ts
import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tag name is required" })
    .max(10, { message: "Tag name too long" }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
