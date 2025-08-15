import { z } from "zod";

export const updateUserSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).optional(),
  name: z.string().min(1, { message: "Name is required" }).optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .optional(),
});
