import { Router } from "express";
import * as inventoryController from "../controllers/inventory.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { authenticate, requireModule } from "../middleware/auth";
import { createInventoryItemSchema, updateInventoryItemSchema } from "../schemas/inventory.schema";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(inventoryController.list));
router.get("/:id", asyncHandler(inventoryController.getById));
router.post("/", requireModule("inventario"), validate(createInventoryItemSchema), asyncHandler(inventoryController.create));
router.put("/:id", requireModule("inventario"), validate(updateInventoryItemSchema), asyncHandler(inventoryController.update));
router.delete("/:id", requireModule("inventario"), asyncHandler(inventoryController.remove));

export default router;
