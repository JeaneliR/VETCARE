import { Router } from "express";
import * as locationsController from "../controllers/locations.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createLocationSchema, updateLocationSchema } from "../schemas/location.schema";

const router = Router();

router.get("/", asyncHandler(locationsController.list));
router.get("/:id", asyncHandler(locationsController.getById));
router.post("/", validate(createLocationSchema), asyncHandler(locationsController.create));
router.put("/:id", validate(updateLocationSchema), asyncHandler(locationsController.update));
router.delete("/:id", asyncHandler(locationsController.remove));

export default router;
