import express, {type Router,} from 'express';
import { RegisterController, LoginController, getCurrentUser, LogoutController } from '../controllers/authController.js';
import {registerLimiter} from '../utils/security/limiter.js';
import { requireAuth } from '../middleware/auth.js';

const router:Router = express.Router();

router.route("/register").post(registerLimiter, RegisterController);
router.route("/login").post(LoginController);
router.route("/logout").post(requireAuth, LogoutController);
router.route("/me").get(requireAuth, getCurrentUser);

export default router;

