# Flexus E-Commerce Platform

## Overview

Flexus is a full-stack e-commerce/admin dashboard platform built with:

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (with Context API), Axios
- **Security:** Cookie-based authentication with JWT access/refresh tokens, rate limiting, CORS allowlist, Helmet

---

## Project Structure

```
Flexus/
├── api/           # Backend (Express API)
│   ├── config/    # DB, mailgun config
│   ├── controllers/  # Route handlers (auth, products, logs, etc.)
│   ├── middleware/   # Security, error handling, auth guards
│   ├── models/       # Mongoose schemas (User, Product, Log)
│   ├── routes/       # Express routers
│   ├── scripts/      # Utility scripts (e.g., resetDb.js)
│   ├── services/     # Business logic (email, logs)
│   ├── src/          # Express app entrypoint
│   ├── utils/        # Mongoose plugins, helpers
│   ├── package.json  # Backend dependencies
│   └── .env          # Backend environment variables
│
├── flexus/        # Frontend (React)
│   ├── public/    # Static assets
│   ├── src/       # React source code
│   │   ├── api/   # Axios instance
│   │   ├── components/ # UI components
│   │   ├── context/    # React Context (Auth, Theme)
│   │   ├── data/       # Static data
│   │   ├── images/     # Images
│   │   ├── pages/      # Route pages
│   │   └── styles/     # CSS
│   ├── package.json    # Frontend dependencies
│   └── .env            # Frontend environment variables
│
└── README.md      # Project documentation
```

---

## Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)
- MongoDB (local or Atlas)

---

## Backend Setup (`api/`)

1. **Install dependencies:**

   ```bash
   cd api
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env` (if present) or edit `.env` directly.
   - Required variables:
     - `MONGODB_URI` (MongoDB connection string)
     - `JWT_SECRET` (random string)
     - `REFRESH_TOKEN_SECRET` (random string, different from JWT_SECRET)
     - `JWT_EXPIRES_IN` (e.g., `15m`)
     - `REFRESH_TOKEN_EXPIRES_IN` (e.g., `7d`)
     - `COOKIE_SECURE` (`false` for local dev, `true` for production/HTTPS)
     - `COOKIE_SAME_SITE` (`lax` for dev, `strict` for prod)
     - `API_VERSION` (default: `v1`)
     - `PORT` (default: `5000`)
     - SMTP/mailgun/AWS vars as needed

3. **Run the backend server:**

   ```bash
   npm run dev
   # or
   npm start
   ```

   - Server runs at `http://localhost:5000` by default

---

## Frontend Setup (`flexus/`)

1. **Install dependencies:**

   ```bash
   cd flexus
   npm install
   ```

2. **Configure environment variables:**
   - Edit `.env` (see `.env.example` if present)
   - Required variables:
     - `REACT_APP_API_ADDRESS` (e.g., `http://localhost:5000`)
     - `REACT_APP_API_VERSION` (e.g., `v1`)

3. **Run the frontend dev server:**

   ```bash
   npm start
   ```

   - Runs at `http://localhost:3000` (or another port)

---

## Authentication Flow

- Uses **httpOnly cookies** for access and refresh tokens (no tokens in localStorage)
- Auto-refreshes tokens on expiry (silent refresh)
- Logout revokes refresh session server-side
- Secure by default: XSS-resistant, CSRF-protected, session rotation

---

## Key Dependencies

### Backend

- express, mongoose, bcryptjs, jsonwebtoken, cookie-parser
- helmet, cors, express-rate-limit
- nodemailer, dotenv

### Frontend

- react, react-router-dom, axios
- react-toastify, aos

---

## Useful Scripts

- **Reset DB:** `node scripts/resetDb.js` (in `api/`)

---

## Troubleshooting

- **CORS errors:** Ensure frontend origin is allowed in backend CORS config and `.env`
- **Cookie issues:** For local dev, set `COOKIE_SECURE=false` in backend `.env`
- **MongoDB connection:** Check `MONGODB_URI` and that MongoDB is running

---

## Security Notes

- Never commit `.env` files or secrets to version control
- Use strong, unique secrets for JWT and refresh tokens
- In production, always use HTTPS and set `COOKIE_SECURE=true`

---

## License

MIT
