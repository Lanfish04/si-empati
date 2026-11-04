import z from "zod";

const scenarioSchema = z.object({
    title: z.string().trim().min(4, "Judul minimal 4 karakter.").max(80, "Judul maksimal 80 karakter."),
    description: z.string().trim().min(4, "Deskripsi minimal 4 karakter.").max(500, "Deskripsi maksimal 500 karakter."),
    isActive: z.boolean().optional(),
    createdBy: z.string().uuid("ID pembuat tidak valid."),
}).strict();

export { scenarioSchema };