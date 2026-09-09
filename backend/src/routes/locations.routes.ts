import { Router } from "express";
import * as locationsController from "../controllers/locations.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createLocationSchema, updateLocationSchema } from "../schemas/location.schema";
import { authenticate, requireModule } from "../middleware/auth";

const router = Router();

// GET es público: el sitio web de la veterinaria muestra las sedes sin
// necesidad de iniciar sesión. Solo crear/editar/eliminar requiere estar
// autenticado y tener permiso sobre el módulo "sedes".
router.get("/", asyncHandler(locationsController.list));
router.get("/:id", asyncHandler(locationsController.getById));
router.post(
  "/",
  authenticate,
  requireModule("sedes"),
  validate(createLocationSchema),
  asyncHandler(locationsController.create)
);
router.put(
  "/:id",
  authenticate,
  requireModule("sedes"),
  validate(updateLocationSchema),
  asyncHandler(locationsController.update)
);
router.delete("/:id", authenticate, requireModule("sedes"), asyncHandler(locationsController.remove));

export default router;
