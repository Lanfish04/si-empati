
import { AppError } from "./app-error.js";

export class ScenarioNotFoundError extends AppError {
  constructor() {
    super(
      404,
      "SCENARIO_NOT_FOUND",
      "Scenario tidak ditemukan."
    );
  }
}

export class ScenarioAlreadyExistsError extends AppError {
  constructor() {
    super(
      409,
      "SCENARIO_ALREADY_EXISTS",
      "Scenario telah terdaftar."
    );
  }
}

export class ScenarioNotDraftError extends AppError {
  constructor(action: "diperbarui" | "dihapus") {
    super(
      409,
      "SCENARIO_NOT_DRAFT",
      `Scenario hanya dapat ${action} ketika berstatus DRAFT.`
    );
  }
}
 