import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

//CORS
app.use(
  cors({
    origin: [allowedOrigin, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Parse request bodies and cookies
app.use(express.json());
app.use(cookieParser());

//Validate Origin for state-changing requests
app.use((req, res, next) => {
  const stateChangingMethods = ["POST", "PUT", "PATCH", "DELETE"];

  if (!stateChangingMethods.includes(req.method)) {
    return next();
  }

  const origin = req.get("Origin");

  const allowedOrigins = [allowedOrigin, "http://localhost:5173"];

  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed",
    });
  }
  next();
});

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);

//Test route
app.get("/", (req, res) => {
  res.json({
    message: "Expense Tracker API is running",
  });
});

//Test MySQL connection
try {
  const connection = await pool.getConnection();

  console.log("MySQL database connected successfully");
  connection.release();
} catch (error) {
  console.error("Database connection failed:", error.message);
}

//Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
