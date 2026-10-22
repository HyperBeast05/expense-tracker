import express from "express";
import {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  updateProfileValidator,
} from "../validators/authValidator.js";
import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateProfile,
} from "../controllers/authController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  loginLimiter,
  passwordResetLimiter,
  resetPasswordLimiter,
} from "../middleware/rateLimitMiddleWare.js";

const router = express.Router();

router.post("/register", registerValidator, validateRequest, registerUser);

router.post("/login", loginLimiter, loginValidator, validateRequest, loginUser);

router.get("/me", authenticateUser, getCurrentUser);

router.put(
  "/profile",
  authenticateUser,
  updateProfileValidator,
  validateRequest,
  updateProfile,
);

router.post("/logout", logoutUser);

router.post(
  "/change-password",
  authenticateUser,
  changePasswordValidator,
  validateRequest,
  changePassword,
);

//forgot-password
router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPasswordValidator,
  validateRequest,
  forgotPassword,
);

//reset-password
router.post(
  "/reset-password",
  resetPasswordLimiter,
  resetPasswordValidator,
  validateRequest,
  resetPassword,
);
export default router;
