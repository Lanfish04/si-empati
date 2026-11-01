import express, {type Router,} from 'express';
import { RegisterController } from '../controller/authController';
import {registerLimiter} from '../config/security/limiter.js';

const router:Router = express.Router();

router.route("/register").post(registerLimiter, RegisterController);


export default router;

