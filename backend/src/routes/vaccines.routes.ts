import { Router } from "express";
import * as vaccinesController from "../controllers/vaccines.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createVaccineSchema, updateVaccineSchema } from "../schemas/vaccine.schema";

const router = Router();

router.get("/", asyncHandler(vaccinesController.list));
router.get("/:id", asyncHandler(vaccinesController.getById));
router.post("/", validate(createVaccineSchema), asyncHandler(vaccinesController.create));
router.put("/:id", validate(updateVaccineSchema), asyncHandler(vaccinesController.update));
router.delete("/:id", asyncHandler(vaccinesController.remove));

export default router;
