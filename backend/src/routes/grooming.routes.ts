import { Router } from "express";
import * as groomingController from "../controllers/grooming.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createGroomingSchema, updateGroomingSchema } from "../schemas/grooming.schema";
import { authenticate, requireModule } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(groomingController.list));
router.get("/:id", asyncHandler(groomingController.getById));
router.post("/", requireModule("grooming"), validate(createGroomingSchema), asyncHandler(groomingController.create));
router.put("/:id", requireModule("grooming"), validate(updateGroomingSchema), asyncHandler(groomingController.update));
router.delete("/:id", requireModule("grooming"), asyncHandler(groomingController.remove));

export default router;
