import {RequestHandler} from 'express';
import {registerUser} from '../service/authService';
import {registerSchema} from '../schema/authSchema';



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
        message: "User registered successfully.",
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

export { RegisterController

};