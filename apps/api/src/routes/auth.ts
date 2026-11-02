import express, {type Router,} from 'express';
import { RegisterController, LoginController, getCurrentUser } from '../controllers/authController.js';
import {registerLimiter} from '../utils/security/limiter.js';
import { requireAuth } from '../middleware/auth.js';

const router:Router = express.Router();

router.route("/register").post(registerLimiter, RegisterController);
router.route("/login").post(LoginController);

router.route("/me").get(requireAuth, getCurrentUser);

export default router;

