import express from "express";
import { authenticateUser } from "../middleware/authMiddleware.js";
import {
  createTransactionValidator,
  updateTransactionValidator,
} from "../validators/transactionValidator.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createTransaction,
  deleteTransaction,
  getCategoryExpenseSummary,
  getMonthlySummary,
  getTransactions,
  getTransactionSummary,
  updateTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  createTransactionValidator,
  validateRequest,
  createTransaction,
);

router.get("/", authenticateUser, getTransactions);

//summary
router.get("/summary", authenticateUser, getTransactionSummary);

router.get("/monthly-summary", authenticateUser, getMonthlySummary);

router.get("/category-summary", authenticateUser, getCategoryExpenseSummary);

router.put(
  "/:id",
  authenticateUser,
  updateTransactionValidator,
  validateRequest,
  updateTransaction,
);

router.delete("/:id", authenticateUser, deleteTransaction);

export default router;
