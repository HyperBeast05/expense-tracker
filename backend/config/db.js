import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isAiven = process.env.DB_HOST?.includes("aivencloud.com");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  dateStrings: true,

  ...(isAiven && {
    ssl: {
      ca: fs.readFileSync(path.join(__dirname, "../certs/ca.pem"), "utf-8"),
      rejectUnauthorized: true,
    },
  }),
});

export default pool;
