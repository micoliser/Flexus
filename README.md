# Flexus E-Commerce Platform

![Flexus Solutions](https://img.shields.io/badge/Flexus-Solutions-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## Overview

Flexus is a robust, full-stack B2B e-commerce platform specifically designed for agricultural commodity exports. It provides a comprehensive product showcase featuring detailed agricultural specifications (e.g., moisture, grade, shelf life, export markets, packaging) and includes a secure administrative dashboard for staff and administrators to manage the catalog, drafts, and user roles.

## Core Features

- **Specialized B2B Product Catalog:** Tailored schema for agricultural exports (origin, certifications, minimum orders).
- **Draft & Publishing Workflow:** Staff can create product drafts and toggle visibility (publish/unpublish) to control the live catalog.
- **Role-Based Access Control (RBAC):** Distinct roles for `Users`, `Staff`, and `Admin`, with restricted routes and data access.
- **High-Security Authentication:**
  - Secure, `HttpOnly` cookie-based sessions.
  - Short-lived JWT access tokens with long-lived refresh tokens.
  - Server-side session revocation and refresh token hashing.
  - Rate limiting against brute-force login attempts.
- **Cloud Media Management:** Direct AWS S3 integration via presigned URLs for secure product image uploads.

---

## Tech Stack & Architecture

### Frontend (`flexus/`)
- **Framework:** React 19, React Router v7
- **Data Fetching:** Axios (with interceptors for token refresh)
- **Styling & UI:** Custom CSS, Bootstrap Icons, AOS (Animate on Scroll)
- **State Management:** React Context API (AuthContext, ThemeContext)

### Backend (`api/`)
- **Server:** Node.js, Express 5
- **Database:** MongoDB, Mongoose (Models: User, Product, Log)
- **Security & Middleware:** Helmet, CORS, Cookie Parser, bcryptjs, jsonwebtoken, express-rate-limit
- **Services:** AWS S3 (S3Client, Pre-signed URLs), Nodemailer (Email integration)

---

## Project Structure

```
Flexus/
├── api/                  # Backend Express Server
│   ├── config/           # Database and third-party integrations config
│   ├── controllers/      # Route handlers for auth, products, users, logs
│   ├── middleware/       # Security limits, roleGuards, auth verification
│   ├── models/           # Mongoose schemas (User, Product, Log)
│   ├── routes/           # Express router endpoints
│   ├── scripts/          # Utility scripts (db reset, seed drafts)
│   ├── services/         # Encapsulated business logic (AWS S3, Nodemailer)
│   ├── src/              # App entrypoint (index.js)
│   └── utils/            # Shared utilities and helpers
│
├── flexus/               # Frontend React Application
│   ├── public/           # Static HTML, icons, manifest
│   └── src/
│       ├── api/          # Axios instance and interceptor configuration
│       ├── components/   # Reusable UI components
│       ├── context/      # React Context providers
│       ├── pages/        # Application routes and views
│       └── styles/       # Global CSS and module styles
│
└── deploy.sh             # Interactive production deployment script
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18 or higher recommended
- **npm**: v9 or higher
- **Database**: MongoDB (Local instance or MongoDB Atlas cluster)
- **Cloud Storage**: AWS S3 Bucket (for image uploads)

### 1. Backend Setup (`api/`)

1. **Install dependencies:**
   ```bash
   cd api
   npm install
   ```

2. **Environment Variables (`api/.env`):**
   Create a `.env` file in the `api/` directory with the following configuration:
   ```env
   # Core Config
   PORT=5000
   API_VERSION=v1
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/flexus_dev
   
   # Security & Auth
   JWT_SECRET=your_super_secret_jwt_string
   REFRESH_TOKEN_SECRET=your_super_secret_refresh_string
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   COOKIE_SECURE=false # Set to true in production (requires HTTPS)
   COOKIE_SAME_SITE=lax # Set to strict in production
   
   # Cloud Storage (AWS S3)
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET_NAME=your_bucket_name
   ```

3. **Run the API server:**
   ```bash
   npm run dev
   # The server will start on http://localhost:5000
   ```

### 2. Frontend Setup (`flexus/`)

1. **Install dependencies:**
   ```bash
   cd flexus
   npm install
   ```

2. **Environment Variables (`flexus/.env`):**
   Create a `.env` file in the `flexus/` directory:
   ```env
   REACT_APP_API_ADDRESS=http://localhost:5000
   REACT_APP_API_VERSION=v1
   ```

3. **Run the React application:**
   ```bash
   npm start
   # The app will start on http://localhost:3000
   ```

---

## Deployment

The project includes an interactive deployment script (`deploy.sh`) to automate moving the application to the production server.

**Note:** Ensure your server is properly configured to accept SSH connections, and the destination paths (`public_html/` and `~/api`) exist.

1. **Run the deployment script from the root directory:**
   ```bash
   ./deploy.sh
   ```

2. **Select your deployment target:**
   - `0`: Deploy both Frontend and API
   - `1`: Deploy Frontend only (Builds React, SCPs to `public_html/`)
   - `2`: Deploy API only (Zips backend, SCPs to remote, unzips, installs deps, restarts node)

---

## API Documentation Overview

The API is mounted at `/api/v1` (based on `API_VERSION`). Key endpoint groups include:

- **Auth** (`/auth`): `/login`, `/refresh`, `/logout`, `/me`
- **Users** (`/users`): Protected admin routes for user management (`/`, `/:id/disable`)
- **Products** (`/products`): 
  - Public routes: `/` (getAll), `/:id` (getById)
  - Protected routes (Staff/Admin): `/draft`, `/upload-url` (S3 presigned URLs), `/:id/publish`, `/:id/unpublish`
- **Logs** (`/logs`): System and activity monitoring endpoints.
- **Email** (`/email`): Contact form and notification handlers.

---

## Useful Tooling & Scripts

Navigate to the `api/` directory to run these administrative scripts:

- **Database Reset:** Completely wipes the local database (Use with caution!)
  ```bash
  npm run db:reset
  ```
- **Seed Products:** Populates the database with initial draft product data for testing.
  ```bash
  npm run db:seed:draft-products
  ```

---

## Troubleshooting

- **CORS Issues:** If the frontend cannot communicate with the backend, verify that the frontend URL is allowed in the backend's CORS configuration.
- **Authentication Failing on Localhost:** Ensure `COOKIE_SECURE=false` in your backend `.env`. Browsers will block secure cookies over plain HTTP.
- **Image Uploads Failing:** Verify your AWS IAM user permissions and ensure the S3 bucket CORS policy allows `PUT` requests from your frontend origin.

---

## License

This project is licensed under the MIT License.
