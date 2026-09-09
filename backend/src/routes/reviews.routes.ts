import { Router } from "express";
import * as reviewsController from "../controllers/reviews.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createReviewSchema, updateReviewSchema } from "../schemas/review.schema";

const router = Router();

router.get("/", asyncHandler(reviewsController.list));
router.get("/:id", asyncHandler(reviewsController.getById));
router.post("/", validate(createReviewSchema), asyncHandler(reviewsController.create));
router.put("/:id", validate(updateReviewSchema), asyncHandler(reviewsController.update));
router.delete("/:id", asyncHandler(reviewsController.remove));

export default router;
