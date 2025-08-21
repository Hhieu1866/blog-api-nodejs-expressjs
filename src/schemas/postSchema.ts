import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  content: z.string().min(1, "Content is required"),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().optional().default(true),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title too long")
    .optional(),
  content: z.string().min(1, "Content is required").optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
