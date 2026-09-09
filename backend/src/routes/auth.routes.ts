import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { loginSchema } from "../schemas/auth.schema";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login", validate(loginSchema), asyncHandler(authController.login));
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
