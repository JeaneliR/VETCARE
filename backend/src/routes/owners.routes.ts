import { Router } from "express";
import * as ownersController from "../controllers/owners.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createOwnerSchema, updateOwnerSchema } from "../schemas/owner.schema";

const router = Router();

router.get("/", asyncHandler(ownersController.list));
router.get("/:id", asyncHandler(ownersController.getById));
router.post("/", validate(createOwnerSchema), asyncHandler(ownersController.create));
router.put("/:id", validate(updateOwnerSchema), asyncHandler(ownersController.update));
router.delete("/:id", asyncHandler(ownersController.remove));

export default router;
