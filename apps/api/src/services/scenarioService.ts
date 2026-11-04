import {RequestHandler} from "express";
import { createHash } from "node:crypto";
import type { UserRole } from "../types/auth.js";
import { prisma } from "../config/client.js";

const 