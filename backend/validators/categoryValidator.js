import { body } from "express-validator";

export const createCategoryValidator = [
  body("name")
    .isString()
    .withMessage("Category name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters"),

  body("type")
    .isString()
    .withMessage("Category type must be a string")
    .trim()
    .notEmpty()
    .withMessage("Category type is required")
    .isIn(["income", "expense"])
    .withMessage("Category type must be income or expense"),
];

export const updateCategoryValidator = [
  body("name")
    .isString()
    .withMessage("Category name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters"),

  body("type")
    .isString()
    .withMessage("Category type must be string")
    .trim()
    .notEmpty()
    .withMessage("Category type is required")
    .isIn(["income", "expense"])
    .withMessage("Category type must be income or expense"),
];
