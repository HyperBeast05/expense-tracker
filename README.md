# Expense Tracker

A full-stack expense tracker built with **React, React Bootstrap, Node.js, Express, and MySQL**. Authentication uses JWTs stored in HTTP-only cookies.

**Live Demo:** [Expense Tracker](https://expense-tracker-ten-gamma-28.vercel.app)

**GitHub Repository:** [Expense Tracker on GitHub](https://github.com/HyperBeast05/expense-tracker)

## Features

- User registration, login, and logout
- JWT-based authentication using HTTP-only cookies
- Forgot password and password reset through Brevo transactional emails
- Transaction management with create, read, update, and delete operations
- Category management
- Transaction filtering and pagination
- Dashboard with income, expense, and balance summaries
- Monthly and category-wise financial summaries and charts
- Profile management and password change

## Technologies Used

**Frontend**

- React
- Vite
- React Bootstrap
- Bootstrap
- React Icons
- Recharts
- React Hook Form

**Backend**

- Node.js
- Express
- MySQL2
- JSON Web Tokens (JWT)
- bcrypt
- express-validator
- Brevo Transactional Email API

**Database**

- MySQL

**Deployment**

- Vercel — frontend
- Render — backend API
- Aiven — MySQL database
- Brevo — password-reset emails

## Prerequisites

- Node.js 22 LTS recommended
- npm (included with Node.js)
- MySQL 8.0+
- MySQL Workbench (optional, for importing and inspecting the schema)
- A Brevo account with a verified sender address for password-reset emails

## 1. Set Up the Database

1. Start MySQL and open MySQL Workbench.
2. Open `database/schema.sql` and execute it.
3. The schema creates the `expense_tracker` database and the four required tables: `users`, `categories`, `transactions`, and `password_reset_tokens`.
4. Confirm the tables exist under the `expense_tracker` schema.

**Important:** This schema file is intended for a new or empty database. `CREATE TABLE IF NOT EXISTS` does not add missing constraints to tables that already exist. Back up an existing database before applying separate migrations. Do not drop an existing database just to use this file.

## 2. Configure the Backend

From the project root, open a terminal and run:

```bash
cd backend
```

Copy `backend/.env.example` to `backend/.env`, then configure the environment variables for your local setup.

Required configuration includes:

```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=expense_tracker
DB_PORT=3306
JWT_SECRET=your_long_random_secret
FRONTEND_URL=http://localhost:5173
```

For password-reset emails, configure:

```env
BREVO_API_KEY=your_brevo_api_key
SMTP_FROM=your_verified_sender_email@example.com
```

Replace the example values with your actual local configuration. The database host and port may differ depending on your MySQL installation.

### Password Reset Email Configuration

The application uses the **Brevo Transactional Email API** to send password-reset emails.

- `BREVO_API_KEY` — your Brevo API key with the required transactional email permission.
- `SMTP_FROM` — your verified sender email address in Brevo. Despite the variable name, the application uses this as the sender address for the Brevo API.
- `FRONTEND_URL` — the frontend URL used to generate password-reset links. Use `http://localhost:5173` for local development.

For deployment, configure these variables in the appropriate hosting provider's environment settings. Set `FRONTEND_URL` to the deployed frontend URL.

The application does not need SMTP host, port, username, or password variables for its current Brevo API implementation.

Install dependencies and start the backend:

```bash
npm ci
npm run dev
```

The API defaults to `http://localhost:5000`.

## 3. Configure the Frontend

Open a second terminal from the project root:

```bash
cd frontend
```

Copy `frontend/.env.example` to `frontend/.env`.

For local development, configure:

```env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies and start Vite:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## 4. Useful Checks

From the `frontend/` directory, run:

```bash
npm run lint
npm run build
```

The backend provides `npm run dev` and `npm start` scripts.

Make sure MySQL is running and the backend environment variables match your local setup.

## Security and Configuration Notes

- Never commit `.env` files or real API keys, database credentials, or JWT secrets. The repository should contain example environment files with placeholders only.
- Use a long, random value for `JWT_SECRET`.
- The frontend uses `withCredentials: true`; the backend's `FRONTEND_URL` and CORS configuration must match the frontend origin.
- The backend requires an allowed `Origin` header for state-changing requests. When testing these requests in Postman locally, set `Origin: http://localhost:5173`.
- Password-reset email delivery requires a valid Brevo API key, the required transactional email permission, and a verified sender address.
- The deployed application uses Vercel, Render, Aiven MySQL, and the Brevo Transactional Email API. Free-tier services may experience downtime or cold starts.
- Review production settings for HTTPS, cookie security, secret management, logging, and database access before exposing the application publicly.

## Database Safeguards

The schema defines:

- A unique email constraint for users
- Unique category names per user and transaction type
- Positive transaction amounts
- Foreign-key constraints
- A composite transaction/category foreign key that ensures a transaction can only reference a category owned by the same user
- Restrictions preventing deletion of a category that is still used by a transaction
- One password-reset-token record per user at a time

## Future Improvements

- Improve database availability for the live demo
- Add automated tests for authentication and transaction workflows
- Add additional reporting and budgeting features

---

Built as a full-stack portfolio project to demonstrate frontend development, REST API development, database design, authentication, and deployment.
