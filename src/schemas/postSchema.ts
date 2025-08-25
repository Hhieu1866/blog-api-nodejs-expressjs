import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(6, "Content must be at least 6 characters"),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  thumbnailUrl: z.string().url().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  content: z
    .string()
    .min(6, "Content must be at least 6 characters")
    .optional(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  thumbnailUrl: z.string().url().optional(),
});
