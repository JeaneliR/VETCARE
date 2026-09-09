import { Router } from "express";
import * as treatmentsController from "../controllers/treatments.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createTreatmentSchema, updateTreatmentSchema } from "../schemas/treatment.schema";
import { authenticate, requireModule } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(treatmentsController.list));
router.get("/:id", asyncHandler(treatmentsController.getById));
router.post(
  "/",
  requireModule("tratamientos"),
  validate(createTreatmentSchema),
  asyncHandler(treatmentsController.create)
);
router.put(
  "/:id",
  requireModule("tratamientos"),
  validate(updateTreatmentSchema),
  asyncHandler(treatmentsController.update)
);
router.delete("/:id", requireModule("tratamientos"), asyncHandler(treatmentsController.remove));

export default router;
