import { Router } from "express";
import * as petsController from "../controllers/pets.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { createPetSchema, updatePetSchema } from "../schemas/pet.schema";
import { authenticate, requireModule } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(petsController.list));
router.get("/:id", asyncHandler(petsController.getById));
router.post("/", requireModule("mascotas"), validate(createPetSchema), asyncHandler(petsController.create));
router.put("/:id", requireModule("mascotas"), validate(updatePetSchema), asyncHandler(petsController.update));
router.delete("/:id", requireModule("mascotas"), asyncHandler(petsController.remove));

export default router;
