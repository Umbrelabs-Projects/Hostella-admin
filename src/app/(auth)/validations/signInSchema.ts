import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().nonempty("Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
