
import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client.js";

import { AppError } from "../utils/error/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  // Jika response sudah dikirim, teruskan error ke Express
  if (res.headersSent) {
    return next(err);
  }

  // 1. Menangani error validasi Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Data yang dikirim tidak valid.",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  // 2. Menangani custom application error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
    });

    return;
  }

  // 3. Menangani error Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        error: "RESOURCE_CONFLICT",
        message: "Data dengan nilai unik tersebut sudah digunakan.",
      });

      return;
    }

    if (err.code === "P2025") {
      res.status(404).json({
        error: "RESOURCE_NOT_FOUND",
        message: "Data yang diminta tidak ditemukan.",
      });

      return;
    }
  }

  // 4. Menangani error yang tidak dikenali
  console.error("[UNHANDLED_ERROR]", err);

  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Terjadi kesalahan pada server.",
  });
};
