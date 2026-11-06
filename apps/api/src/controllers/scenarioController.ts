import type { RequestHandler } from "express";
import { createScenario } from "../services/scenarioService";
import { scenarioSchema } from "../schemas/scenarioSchema";


function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

const CreateScenarioController: RequestHandler = async (req, res, next) => {
  const validation = scenarioSchema.safeParse(req.body);

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
    
    if (!scenario) {
      return res.status(409).json({
        error: "SCENARIO_ALREADY_EXISTS",
        message: "Scenario telah terdaftar.",
      });
    }

    return res.status(201).json({
      message: "Scenario berhasil dibuat.",
      data: {
        scenario
      },
    });



} catch (error) {
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({
        error: "SCENARIO_ALREADY_EXISTS",
        message: "Scenario telah terdaftar.",
      });
    }   

    next(error);
}

}



export { CreateScenarioController };