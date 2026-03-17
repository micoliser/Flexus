import express from "express";
import EmailController from "../controllers/emailController.js";
import { contactLimiter, quoteLimiter } from "../middleware/security.js";

const router = express.Router();

// POST /api/v1/email/contact
router.post("/contact", contactLimiter, EmailController.sendContactEmail);

// POST /api/v1/email/quote
router.post("/quote", quoteLimiter, EmailController.sendQuoteEmail);

export default router;
