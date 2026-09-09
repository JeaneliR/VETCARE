import { Router } from "express";
import * as reviewsController from "../controllers/reviews.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createReviewSchema, updateReviewSchema } from "../schemas/review.schema";
import { authenticate, requireModule } from "../middleware/auth";

const router = Router();

// GET es público: el sitio web muestra las reseñas de clientes sin login.
// Registrar/editar/eliminar reseñas sigue siendo tarea del staff autenticado.
router.get("/", asyncHandler(reviewsController.list));
router.get("/:id", asyncHandler(reviewsController.getById));
router.post(
  "/",
  authenticate,
  requireModule("resenas"),
  validate(createReviewSchema),
  asyncHandler(reviewsController.create)
);
router.put(
  "/:id",
  authenticate,
  requireModule("resenas"),
  validate(updateReviewSchema),
  asyncHandler(reviewsController.update)
);
router.delete("/:id", authenticate, requireModule("resenas"), asyncHandler(reviewsController.remove));

export default router;
