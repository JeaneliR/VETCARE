import { Request, Router } from "express";
import * as groomingController from "../controllers/grooming.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate, parseIdParam } from "../middleware/validate";
import { createGroomingSchema, updateGroomingSchema } from "../schemas/grooming.schema";
import { authenticate, requireModule, requireSedeAccess } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();

router.use(authenticate);

async function existingSedeId(req: Request) {
  const servicio = await prisma.grooming.findUnique({
    where: { id: parseIdParam(req.params.id) },
    select: { sedeId: true },
  });
  return servicio?.sedeId ?? null;
}

router.get("/", asyncHandler(groomingController.list));
router.get("/:id", asyncHandler(groomingController.getById));
router.post(
  "/",
  requireModule("grooming"),
  validate(createGroomingSchema),
  requireSedeAccess((req) => [req.body.sedeId]),
  asyncHandler(groomingController.create)
);
router.put(
  "/:id",
  requireModule("grooming"),
  validate(updateGroomingSchema),
  requireSedeAccess(async (req) => [await existingSedeId(req), req.body.sedeId ?? null]),
  asyncHandler(groomingController.update)
);
router.delete(
  "/:id",
  requireModule("grooming"),
  requireSedeAccess(async (req) => [await existingSedeId(req)]),
  asyncHandler(groomingController.remove)
);

export default router;