import type { RequestHandler } from "express";
import { getAllScenarios, getScenarioById, createScenario, updateScenario, deleteScenario } from "../services/scenarioService";
import { getAllScenariosQuerySchema, createScenarioSchema, updateScenarioSchema } from "../schemas/scenarioSchema";


function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}


// GET ALL SCENARIOS
const GetAllScenariosController: RequestHandler = async (req, res, next) => {
  try {
  
    const query = getAllScenariosQuerySchema.parse(req.query);
    const result = await getAllScenarios(query);
    res.status(200).json({
      message: "Daftar scenario berhasil diambil.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const GetScenarioByIdController: RequestHandler = async (req, res, next) => {
  try{
  const scenarioId = req.params;
  const scenario = await getScenarioById(scenarioId);
  res.status(200).json({
    message: "Scenario berhasil diambil.",
    data: scenario,
  });
  
  }catch(error){
    next(error);
  }
}

const CreateScenarioController: RequestHandler = async (req, res, next) => {
  const validation = createScenarioSchema.safeParse(req.body);

if (!validation.success) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Data registrasi tidak valid.",
      details: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const createdById = req.user?.id;
    if (!createdById) {
      return res.status(401).json({
      error: "UNAUTHENTICATED",
      message: "Silakan login terlebih dahulu.",
    });
    }

    const scenario = await createScenario(validation.data, createdById);
    return res.status(201).json({
      message: "Scenario berhasil dibuat.",
      data: {
        scenario
      },
    });

} catch (error) {
    next(error);
}
}

const UpdateScenarioController: RequestHandler = async (req, res, next) => {
   try {
    // 1. Validasi request body
    const input = updateScenarioSchema.parse(req.body);

    // 2. Ambil ID dari URL parameter
    const { scenarioId } = req.params;

    // 3. Panggil service
    const scenario = await updateScenario(
      scenarioId,
      input
    );

    // 4. Kirim response
    res.status(200).json({
      message: "Scenario berhasil diperbarui.",
      data: scenario,
    });
  } catch (error) {
    next(error);
  }
};

export { CreateScenarioController, UpdateScenarioController, GetScenarioByIdController, GetAllScenariosController };