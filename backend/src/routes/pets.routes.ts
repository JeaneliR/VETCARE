import { Router } from "express";
import * as petsController from "../controllers/pets.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createPetSchema, updatePetSchema } from "../schemas/pet.schema";

const router = Router();

router.get("/", asyncHandler(petsController.list));
router.get("/:id", asyncHandler(petsController.getById));
router.post("/", validate(createPetSchema), asyncHandler(petsController.create));
router.put("/:id", validate(updatePetSchema), asyncHandler(petsController.update));
router.delete("/:id", asyncHandler(petsController.remove));

export default router;
