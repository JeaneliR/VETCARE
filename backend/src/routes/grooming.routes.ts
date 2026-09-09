import { Router } from "express";
import * as groomingController from "../controllers/grooming.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createGroomingSchema, updateGroomingSchema } from "../schemas/grooming.schema";

const router = Router();

router.get("/", asyncHandler(groomingController.list));
router.get("/:id", asyncHandler(groomingController.getById));
router.post("/", validate(createGroomingSchema), asyncHandler(groomingController.create));
router.put("/:id", validate(updateGroomingSchema), asyncHandler(groomingController.update));
router.delete("/:id", asyncHandler(groomingController.remove));

export default router;
