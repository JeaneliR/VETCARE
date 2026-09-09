import { Router } from "express";
import * as appointmentsController from "../controllers/appointments.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createAppointmentSchema, updateAppointmentSchema } from "../schemas/appointment.schema";
import { authenticate, requireModule } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(appointmentsController.list));
router.get("/:id", asyncHandler(appointmentsController.getById));
router.post("/", requireModule("citas"), validate(createAppointmentSchema), asyncHandler(appointmentsController.create));
router.put("/:id", requireModule("citas"), validate(updateAppointmentSchema), asyncHandler(appointmentsController.update));
router.delete("/:id", requireModule("citas"), asyncHandler(appointmentsController.remove));

export default router;
