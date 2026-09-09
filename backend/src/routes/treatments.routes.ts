import { Router } from "express";
import * as treatmentsController from "../controllers/treatments.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createTreatmentSchema, updateTreatmentSchema } from "../schemas/treatment.schema";

const router = Router();

router.get("/", asyncHandler(treatmentsController.list));
router.get("/:id", asyncHandler(treatmentsController.getById));
router.post("/", validate(createTreatmentSchema), asyncHandler(treatmentsController.create));
router.put("/:id", validate(updateTreatmentSchema), asyncHandler(treatmentsController.update));
router.delete("/:id", asyncHandler(treatmentsController.remove));

export default router;
