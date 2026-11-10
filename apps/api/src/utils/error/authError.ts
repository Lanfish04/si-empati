import { AppError } from "./app-error.js";

export class AuthError extends AppError {
  constructor() {
    super(
      401,
      "AUTH_ERROR",
      "Anda tidak memiliki izin untuk mengakses resource ini."
    );
  }
}