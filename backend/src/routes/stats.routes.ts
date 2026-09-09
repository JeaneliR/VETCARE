import { Router } from "express";
import * as statsController from "../controllers/stats.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/summary", asyncHandler(statsController.summary));

export default router;
