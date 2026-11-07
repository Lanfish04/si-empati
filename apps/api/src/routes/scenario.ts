import express, {type Router,} from 'express';
import {CreateScenarioController} from '../controllers/scenarioController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';


const router:Router = express.Router();

router.route("/").post(requireAuth, requireRole('ADMIN'), CreateScenarioController);

export default router;