# Expense Tracker

A full-stack expense tracker built with React, React Bootstrap, Node.js, Express, and MySQL. Authentication uses JWTs stored in HTTP-only cookies.

## Prerequisites

- Node.js 22 LTS recommended
- npm (included with Node.js)
- MySQL 8.0+
- MySQL Workbench (optional, for importing and inspecting the schema)
- SMTP credentials if you want to test password-reset emails

## 1. Set up the database

1. Start MySQL and open MySQL Workbench.
2. Open `database/schema.sql` and execute it. It creates the `expense_tracker` database and the four required tables: `users`, `categories`, `transactions`, and `password_reset_tokens`.
3. Confirm the tables exist under the `expense_tracker` schema.

**Important:** This schema file is intended for a new/empty database. `CREATE TABLE IF NOT EXISTS` does not add missing constraints to tables that already exist. Back up an existing database before applying any separate migrations. Do not drop your existing database to use this file.

## 2. Configure the backend

From the project root:

```bash
cd backend
```

Copy `backend/.env.example` to `backend/.env`, then set values for your environment:

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `JWT_SECRET` — use a long, random secret; do not commit it
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- `FRONTEND_URL=http://localhost:5173` for local development

Install dependencies and start the backend:

```bash
npm ci
npm run dev
```

The API defaults to `http://localhost:5000`.

## 3. Configure the frontend

Open a second terminal from the project root:

```bash
cd frontend
```

Copy `frontend/.env.example` to `frontend/.env`. For local development it contains:

```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and start Vite:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## 4. Useful checks

From `frontend/`:

```bash
npm run lint
npm run build
```

The backend has `npm run dev` and `npm start` scripts. Make sure MySQL is running and the backend `.env` values match your local setup.

## Security and configuration notes

- Never commit `.env` files or real SMTP/database/JWT credentials. The repository includes `.env.example` files with placeholders.
- The frontend uses `withCredentials: true`; the backend's `FRONTEND_URL` must match the frontend origin.
- The backend requires an allowed `Origin` header for state-changing requests. When testing those requests in Postman locally, set `Origin: http://localhost:5173`.
- Password-reset email delivery requires valid SMTP credentials and a verified sender address.
- This is a portfolio project. Review production deployment settings (HTTPS, cookie settings, secret management, logging, and database access) before exposing it publicly.

## Database safeguards

The schema defines a unique email constraint, unique category names per user/type, positive transaction amounts, foreign keys, and a composite transaction/category foreign key that ensures a transaction can only reference a category owned by the same user. A category used by a transaction cannot be deleted. One password-reset-token record per user is allowed at a time.
