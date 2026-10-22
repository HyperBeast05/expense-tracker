import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  limit: 10, //Maximum 10 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  limit: 5, //Maximum 5 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many password reset requests. Please try again after 15 minutes.",
  },
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  limit: 10, //Maximum 10 requests per window
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many password reset attempts. Please try again after 15 minutes.",
  },
});
