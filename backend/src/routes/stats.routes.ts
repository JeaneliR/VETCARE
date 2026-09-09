import { Router } from "express";
import * as statsController from "../controllers/stats.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/summary", authenticate, asyncHandler(statsController.summary));

export default router;
