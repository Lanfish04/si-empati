import z from "zod";
import slugify from "slugify";

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


export const getAllScenariosQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z
      .enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
      .optional(),

    category: z.string().trim().min(1).max(50).optional(),
    search: z.string().trim().min(1).max(120).optional(),
  })
  .strict();



const createScenarioSchema = z.object({
    title: z.string().trim().min(4, "Judul minimal 4 karakter.").max(80, "Judul maksimal 80 karakter."),
    description: z.string().trim().min(4, "Deskripsi minimal 4 karakter.").max(500, "Deskripsi maksimal 500 karakter."),
    category: z.string().min(2, "ID kategori tidak valid."),
}).strict().transform((data) => {
    // Otomatis membuat properti slug berdasarkan data.title
    const generatedSlug = slugify(data.title, {
      lower: true,
      strict: true,
      trim: true,
    });
    return {
      ...data,
      slug: generatedSlug,
    };
  });

    


const updateScenarioSchema = z.object({
    title: z.string().trim().min(4, "Judul minimal 4 karakter.").max(80, "Judul maksimal 80 karakter.").optional(),
    description: z.string().trim().min(4, "Deskripsi minimal 4 karakter.").max(500, "Deskripsi maksimal 500 karakter.").optional()
}).strict().transform((data) => {
    // Jika title ikut diubah oleh pengguna, otomatis perbarui juga slug-nya
    if (data.title) {
      return {
        ...data,
        slug: slugify(data.title, { 
          lower: true,
          strict: true,
          trim: true }),
      };
    }
    return data;
  });
;



export { createScenarioSchema, updateScenarioSchema, };

export type ScenarioInput = z.infer<typeof createScenarioSchema>;