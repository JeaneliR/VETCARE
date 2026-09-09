import { Router } from "express";
import * as ownersController from "../controllers/owners.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createOwnerSchema, updateOwnerSchema } from "../schemas/owner.schema";
import { authenticate, requireModule } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(ownersController.list));
router.get("/:id", asyncHandler(ownersController.getById));
router.post("/", requireModule("duenos"), validate(createOwnerSchema), asyncHandler(ownersController.create));
router.put("/:id", requireModule("duenos"), validate(updateOwnerSchema), asyncHandler(ownersController.update));
router.delete("/:id", requireModule("duenos"), asyncHandler(ownersController.remove));

export default router;
