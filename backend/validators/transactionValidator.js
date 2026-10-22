import { body } from "express-validator";

export const createTransactionValidator = [
  body("categoryId")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),

  body("type")
    .isString()
    .withMessage("Transaction type must be a string")
    .trim()
    .notEmpty()
    .withMessage("Transaction type is required")
    .isIn(["income", "expense"])
    .withMessage("Transaction type must be income or expense"),

  body("amount")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a valid number with up to 2 decimal places")
    .custom((value) => Number(value) > 0)
    .withMessage("Amount must be greater than 0"),

  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description cannot exceed 255 characters"),

  body("transactionDate")
    .isISO8601()
    .withMessage("Transaction date must be a valid date")
    .custom((value) => {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid transaction date");
      }

      return true;
    }),
];

export const updateTransactionValidator = [
  body("categoryId")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer"),

  body("type")
    .isString()
    .withMessage("Transaction type must be a string")
    .trim()
    .notEmpty()
    .withMessage("Transaction type is required")
    .isIn(["income", "expense"])
    .withMessage("Transaction type must be income or expense"),

  body("amount")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Amount must be a valid number with up to 2 decimal places")
    .custom((value) => Number(value) > 0)
    .withMessage("Amount must be greater than 0"),

  body("description")
    .optional({ values: "null" })
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ max: 255 })
    .withMessage("Description cannot exceed 255 characters"),

  body("transactionDate")
    .isISO8601()
    .withMessage("Transaction date must be a valid date"),
];
