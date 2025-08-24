import { z } from "zod";

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tag name is required" })
    .max(10, { message: "Tag name too long" }),
  // .regex(/^[a-zA-Z0-9\s\-_]+$/, {
  //   message:
  //     "Tag name can only contain letters, numbers, spaces, hyphens and underscores",
  // }),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
