import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, { message: "Content là bắt buộc" }),
});

export const updateCommentSchema = createCommentSchema;
