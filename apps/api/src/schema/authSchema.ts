
import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(4, "Nama minimal 4 karakter.")
      .max(80, "Nama maksimal 80 karakter."),

    email: z
      .string()
      .email("Format email tidak valid.")
      .max(254, "Email terlalu panjang.")
      .transform((value) => value.toLowerCase()),

    password: z
      .string()
      .min(8, "Password minimal 8 karakter.")
      .max(128, "Password maksimal 128 karakter."),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
