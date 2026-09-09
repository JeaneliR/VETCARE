import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createUserSchema, updateUserSchema } from "../schemas/auth.schema";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// Todo el módulo de usuarios es exclusivo del administrador principal.
router.use(authenticate, requireAdmin);

router.get("/", asyncHandler(usersController.list));
router.get("/:id", asyncHandler(usersController.getById));
router.post("/", validate(createUserSchema), asyncHandler(usersController.create));
router.put("/:id", validate(updateUserSchema), asyncHandler(usersController.update));
router.delete("/:id", asyncHandler(usersController.remove));

export default router;
