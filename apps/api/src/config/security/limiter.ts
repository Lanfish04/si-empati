import { rateLimit } from "express-rate-limit";


// Rate limiter untuk seluruh API.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "Terlalu banyak request. Coba lagi nanti.",
  },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "REGISTER_RATE_LIMITED",
    message:
      "Terlalu banyak percobaan registrasi. Coba lagi nanti.",
  },
});


export {
apiLimiter,
registerLimiter
};