import z from "zod";


const scenarioSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug minimal 3 karakter.")
  .max(120, "Slug maksimal 120 karakter.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung."
  );

const scenarioSchema = z.object({
    title: z.string().trim().min(4, "Judul minimal 4 karakter.").max(80, "Judul maksimal 80 karakter."),
    description: z.string().trim().min(4, "Deskripsi minimal 4 karakter.").max(500, "Deskripsi maksimal 500 karakter."),
    slug : scenarioSlugSchema,
    category: z.string().min(2, "ID kategori tidak valid."),
}).strict();




export { scenarioSchema };

export type ScenarioInput = z.infer<typeof scenarioSchema>;