import {RequestHandler} from 'express';
import {registerUser, loginUser, revokeSession} from '../services/authService';
import {registerSchema, loginSchema} from '../schemas/authSchema';
import {createSession} from '../utils/session';



function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}


const RegisterController: RequestHandler = async (req, res, next) => {
 const validation = registerSchema.safeParse(req.body);

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
  
      const user = await registerUser(validation.data);
      return res.status(201).json({
        message: "User berhasil didaftarkan.",
        data: {
          user
        },
      });
    }
        catch(error){
          if(isUniqueConstraintError(error)) {
            return res.status(409).json({
              error: "EMAIL_ALREADY_REGISTERED",
              message: "Email sudah terdaftar.",
            });
          }
          next(error);
        }
    }

const LoginController: RequestHandler = async (req, res, next) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Data login tidak valid.",
      details: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const user = await loginUser(validation.data);

    if (!user) {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Email atau password salah.",
      });
    }

    const session = await createSession(user.id);
    
    res.cookie("si_empati_session", session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    return res.status(200).json({
      message: "Login successful.",
      data: {
        user
      },
    });
  } catch (error) {
    next(error);
  }
};


const getCurrentUser: RequestHandler = (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: "UNAUTHENTICATED",
      message: "Silakan login terlebih dahulu.",
    });
  }

  return res.status(200).json({
    message: "Data user berhasil ditemukan.",
    data: {
      user: req.user,
    },
  });
};

const LogoutController: RequestHandler = async (req, res, next) => {
  try {
    const sessionToken = req.cookies?.si_empati_session;
 
    if (!sessionToken) {
      return res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "Session tidak ditemukan.",
      });
    }

  await revokeSession(sessionToken);

  res.clearCookie("si_empati_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

    return res.status(200).json({
      message: "Logout berhasil.",
    });
  }

  catch(error) {
    return next(error);
  }
}

export { 
  RegisterController,
  LoginController,
  getCurrentUser,
  LogoutController
};  