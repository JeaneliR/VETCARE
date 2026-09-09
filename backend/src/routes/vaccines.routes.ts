import { Router } from "express";
import * as vaccinesController from "../controllers/vaccines.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createVaccineSchema, updateVaccineSchema } from "../schemas/vaccine.schema";
import { authenticate, requireModule } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(vaccinesController.list));
router.get("/:id", asyncHandler(vaccinesController.getById));
router.post("/", requireModule("vacunas"), validate(createVaccineSchema), asyncHandler(vaccinesController.create));
router.put("/:id", requireModule("vacunas"), validate(updateVaccineSchema), asyncHandler(vaccinesController.update));
router.delete("/:id", requireModule("vacunas"), asyncHandler(vaccinesController.remove));

export default router;
