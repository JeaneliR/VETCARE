import { Request, Router } from "express";
import * as appointmentsController from "../controllers/appointments.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate, parseIdParam } from "../middleware/validate";
import { createAppointmentSchema, updateAppointmentSchema } from "../schemas/appointment.schema";
import { authenticate, requireModule, requireSedeAccess } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();

router.use(authenticate);

async function existingSedeId(req: Request) {
  const cita = await prisma.appointment.findUnique({
    where: { id: parseIdParam(req.params.id) },
    select: { sedeId: true },
  });
  return cita?.sedeId ?? null;
}

router.get("/", asyncHandler(appointmentsController.list));
router.get("/:id", asyncHandler(appointmentsController.getById));
router.post(
  "/",
  requireModule("citas"),
  validate(createAppointmentSchema),
  requireSedeAccess((req) => [req.body.sedeId]),
  asyncHandler(appointmentsController.create)
);
router.put(
  "/:id",
  requireModule("citas"),
  validate(updateAppointmentSchema),
  requireSedeAccess(async (req) => [await existingSedeId(req), req.body.sedeId ?? null]),
  asyncHandler(appointmentsController.update)
);
router.delete(
  "/:id",
  requireModule("citas"),
  requireSedeAccess(async (req) => [await existingSedeId(req)]),
  asyncHandler(appointmentsController.remove)
);

export default router;