import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/categoryValidator.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  createCategoryValidator,
  validateRequest,
  createCategory,
);

router.get("/", authenticateUser, getCategories);

router.put(
  "/:id",
  authenticateUser,
  updateCategoryValidator,
  validateRequest,
  updateCategory,
);

router.delete("/:id", authenticateUser, deleteCategory);
export default router;
