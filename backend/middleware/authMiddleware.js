import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    //Veriry the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Check the user's current token version
    const [users] = await pool.query(
      `SELECT id, token_version
       FROM users
       WHERE id = ?
      `,
      [decoded.userId],
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    //Rejct tokens issued with and older version
    if (decoded.tokenVersion !== user.token_version) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again",
      });
    }

    req.user = { id: decoded.userId };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};
