import { body } from "express-validator";

export const registerValidator = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
];

export const loginValidator = [
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .withMessage("Password is required"),
];

export const changePasswordValidator = [
  body("currentPassword")
    .isString()
    .withMessage("Current password must be a string")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isString()
    .withMessage("New password must be a string")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("New password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
];

export const forgotPasswordValidator = [
  body("email")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

export const resetPasswordValidator = [
  body("token")
    .isString()
    .withMessage("Reset token must be a string")
    .trim()
    .notEmpty()
    .withMessage("Reset token is required"),

  body("newPassword")
    .isString()
    .withMessage("New password must be a string")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8, max: 128 })
    .withMessage("New password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
];

export const updateProfileValidator = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("email")
    .isString()
    .withMessage("Email must be a string")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];
