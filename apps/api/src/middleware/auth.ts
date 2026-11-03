
import type { RequestHandler } from "express";
import { createHash } from "node:crypto";
import type { UserRole } from "../types/auth.js";
import { prisma } from "../config/client.js";

const requireAuth: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const sessionToken = req.cookies?.si_empati_session;

    if (!sessionToken) {
      return res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "Silakan login terlebih dahulu.",
      });
    }

    const tokenHash = createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    const session = await prisma.session.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(401).json({
        error: "INVALID_SESSION",
        message: "Session tidak valid.",
      });
    }

    if (session.expiresAt <= new Date()) {
      return res.status(401).json({
        error: "SESSION_EXPIRED",
        message: "Session telah kedaluwarsa.",
      });
    }

    req.user = session.user;

    return next();
  } catch (error) {
    return next(error);
  }
};



function requireRole(...allowedRoles: UserRole[] ): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "Silakan login terlebih dahulu.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "Kamu tidak memiliki izin untuk mengakses.",
      });
    }

    return next();
  };
}



export default {
requireAuth,
requireRole,
}
