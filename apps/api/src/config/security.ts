
import "dotenv/config";

import { randomBytes } from "node:crypto";
import type { RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import { doubleCsrf } from "csrf-csrf";

const isProduction = process.env.NODE_ENV === "production";
const csrfSecret = process.env.CSRF_SECRET;

if (!csrfSecret || csrfSecret.length < 32) {
  throw new Error(
    "CSRF_SECRET belum diatur atau terlalu pendek."
  );
}

// Prefix __Host- digunakan di production.
// Prefix ini mensyaratkan cookie Secure, Path=/,
// dan tidak menggunakan atribut Domain.
const csrfBindingCookieName = isProduction
  ? "__Host-siempati-csrf-binding"
  : "siempati-csrf-binding";

const csrfTokenCookieName = isProduction
  ? "__Host-siempati-csrf-token"
  : "siempati-csrf-token";

// Rate limiter untuk seluruh API.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "Terlalu banyak request. Coba lagi nanti.",
  },
});

// Membuat identitas acak untuk browser sebelum login.
// Identitas ini digunakan sebagai pengikat token CSRF.
export const ensureCsrfBindingCookie: RequestHandler = ( req, res, next ) => {
  const currentBinding =
    req.cookies?.[csrfBindingCookieName];

  if (
    typeof currentBinding === "string" &&
    /^[a-f0-9]{64}$/.test(currentBinding)
  ) {
    next();
    return;
  }

  const binding = randomBytes(32).toString("hex");

  res.cookie(csrfBindingCookieName, binding, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });

  // Agar middleware berikutnya dapat membaca nilai
  // yang baru dibuat pada request yang sama.
  req.cookies = {...(req.cookies ?? {}), [csrfBindingCookieName]: binding,
  };

  next();
};

// Konfigurasi perlindungan CSRF.
const { doubleCsrfProtection, generateCsrfToken} = doubleCsrf({
  getSecret: () => csrfSecret,
  getSessionIdentifier: (req) => {
    const binding = req.cookies?.[csrfBindingCookieName];

    if (typeof binding !== "string") {
      throw new Error("CSRF binding cookie tidak ditemukan.");
    }

    return binding;
  },

  cookieName: csrfTokenCookieName,

  cookieOptions: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 1000,
  },

  getCsrfTokenFromRequest: (req) =>
    req.get("x-csrf-token"),
});

export { generateCsrfToken };
export const csrfProtection = doubleCsrfProtection;
