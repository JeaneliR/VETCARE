import { Router } from "express";
import * as reviewsController from "../controllers/reviews.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createReviewSchema, updateReviewSchema } from "../schemas/review.schema";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// Las reseñas ya no son un módulo del sistema interno: se muestran y se
// crean desde la web pública, sin login (así el cliente puede dejar la
// suya directo desde el sitio). Editarlas/borrarlas (moderación) sigue
// requiriendo ser ADMIN.
router.get("/", asyncHandler(reviewsController.list));
router.get("/:id", asyncHandler(reviewsController.getById));
router.post("/", validate(createReviewSchema), asyncHandler(reviewsController.create));
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validate(updateReviewSchema),
  asyncHandler(reviewsController.update)
);
router.delete("/:id", authenticate, requireAdmin, asyncHandler(reviewsController.remove));

export default router;