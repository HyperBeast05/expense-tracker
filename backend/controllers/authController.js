import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/email.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //Check if email already exists
    const [existingUsers] = await pool.query(
      `SELECT id FROM users WHERE email = ?`,
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    //Create user
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password)
             VALUES(?, ?, ?)
            `,
      [name, email, hashedPassword],
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: result.insertId,
        name,
        email,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    console.error("Register user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Find user by email
    const [users] = await pool.query(
      `SELECT id, name, email, password, token_version
             FROM users
             WHERE email = ?
            `,
      [email],
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    //compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //Create JWT
    const token = jwt.sign(
      {
        userId: user.id,
        tokenVersion: user.token_version,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    //Store JWT in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const { currentPassword, newPassword } = req.body;

    //Get current user's password
    const [users] = await pool.query(
      `SELECT password FROM users WHERE id = ?`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    //Check current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        field: "currentPassword",
        message: "Current password is incorrect",
      });
    }

    //Prevent using the same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    //Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    //Update password
    await pool.query(
      `UPDATE users
       SET password = ?, token_version = token_version + 1
       WHERE id = ?
      `,
      [hashedPassword, userId],
    );

    //Clear authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    //find user by email
    const [users] = await pool.query(
      `SELECT id, email
       FROM users
       WHERE email = ?
      `,
      [email],
    );

    /*
      Always return the same response,
      whether the email exists or not.
    */

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const user = users[0];

    //Generate secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    //Hash token before storing it
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    //Remove expird or already-used reset tokens
    await pool.query(
      `DELETE FROM password_reset_tokens
       WHERE expires_at <= NOW()
        OR used_at IS NOT NULL
      `,
    );

    //Remove any existing reset token for this user
    await pool.query(
      `DELETE FROM password_reset_tokens
       WHERE user_id = ?
      `,
      [user.id],
    );

    //Store the reset token
    await pool.query(
      `INSERT INTO password_reset_tokens
         (user_id, token_hash, expires_at)
         VALUES (?, ?, ?)
        `,
      [user.id, tokenHash, expiresAt],
    );

    //Send password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  let connection;
  let transactionStarted = false;

  try {
    const { token, newPassword } = req.body;

    //Hash the token received from the client
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    //Get a database connection
    connection = await pool.getConnection();

    //Start the transaction
    await connection.beginTransaction();
    transactionStarted = true;

    //Find and lock the valid reset token
    const [resetToken] = await connection.query(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = ?
        AND expires_at > NOW()
        AND used_at IS NULL
       FOR UPDATE
      `,
      [tokenHash],
    );

    //Check whether the token is valid
    if (resetToken.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    const resetTokenRecord = resetToken[0];

    //Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    //Update user's password
    await connection.query(
      `UPDATE users
       SET password = ?, token_version = token_version + 1
       WHERE id = ?
      `,
      [hashedPassword, resetTokenRecord.user_id],
    );

    //Mark the reset token as used
    await connection.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = ?
      `,
      [resetTokenRecord.id],
    );

    //Commit both changes
    await connection.commit();
    transactionStarted = false;

    //Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in again.",
    });
  } catch (error) {
    //Roll back if the transaction has not been committed
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Password reset rollback error:", rollbackError);
      }
    }

    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    //Always release the database connection
    if (connection) {
      connection.release();
    }
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT id, name, email
       FROM users
       WHERE id = ?
      `,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: users[0],
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const [existingUsers] = await pool.query(
      `SELECT id 
       FROM users
       WHERE email = ? AND id <> ?
       LIMIT 1
      `,
      [email, userId],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const [result] = await pool.query(
      `UPDATE users
       SET name = ?, email = ?
       WHERE id = ?
      `,
      [name, email, userId],
    );

    if (result.affectedRows === 0) {
      const [users] = await pool.query(
        "SELECT id FROM users WHERE id = ? LIMIT 1",
        [userId],
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: userId,
        name,
        email,
      },
    });
  } catch (error) {
    //Handle a duplicate email if another request
    //registers it between the check and the update.
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
