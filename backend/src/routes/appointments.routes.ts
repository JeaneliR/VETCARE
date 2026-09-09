import { Router } from "express";
import * as appointmentsController from "../controllers/appointments.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createAppointmentSchema, updateAppointmentSchema } from "../schemas/appointment.schema";

const router = Router();

router.get("/", asyncHandler(appointmentsController.list));
router.get("/:id", asyncHandler(appointmentsController.getById));
router.post("/", validate(createAppointmentSchema), asyncHandler(appointmentsController.create));
router.put("/:id", validate(updateAppointmentSchema), asyncHandler(appointmentsController.update));
router.delete("/:id", asyncHandler(appointmentsController.remove));

export default router;
