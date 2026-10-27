
import "dotenv/config";

import express, {type ErrorRequestHandler,} from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import {
  apiLimiter,
  csrfProtection,
  ensureCsrfBindingCookie,
  generateCsrfToken,
} from "./config/security.js";

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// 1. HTTP security headers.
app.use(helmet());

// 2. CORS: izinkan origin frontend yang terdaftar.
app.use( 
    cors({ origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "X-CSRF-Token",
    ],
    maxAge: 600,
  })
);

// 3. Batasi request API.
app.use("/api", apiLimiter);

// 4. Baca cookie dan body JSON.
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

// 5. Siapkan binding CSRF untuk browser.
app.use("/api", ensureCsrfBindingCookie);

// 6. Health check.
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// 7. Endpoint untuk memperoleh token CSRF.
app.get("/api/csrf-token", (req, res) => {
  const csrfToken = generateCsrfToken(req, res, {
    overwrite: true,
  });

  res.status(200).json({
    csrfToken,
  });
});

// 8. Request yang mengubah data harus lolos CSRF.
app.use("/api", csrfProtection);

// Nanti, mount route autentikasi di sini.
// Contoh: app.use("/api/auth", authRouter);

// 9. Respons untuk endpoint API yang tidak ditemukan.
app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Endpoint API tidak ditemukan.",
  });
});

// 10. Error handler terakhir.
const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const errorCode = typeof err === "object" && err !== null && "code" in err ? (err as { code?: unknown }).code : undefined;

  if (errorCode === "EBADCSRFTOKEN") {
    res.status(403).json({
      error: "CSRF_TOKEN_INVALID",
      message: "Token CSRF tidak valid atau tidak tersedia.",
    });
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Terjadi kesalahan pada server.",
  });
};

app.use(errorHandler);

export default app;
