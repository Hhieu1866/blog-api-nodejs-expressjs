import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, { message: "Content là bắt buộc" }),
  parentId: z.string().uuid().optional().nullable(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, { message: "Content là bắt buộc" }).optional(),
});
