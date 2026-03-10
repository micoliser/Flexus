import express from "express";
import emailController from "../controllers/emailController.js";

const router = express.Router();

// POST /api/v1/email/contact
router.post("/contact", emailController.sendContactEmail);

// POST /api/v1/email/quote
router.post("/quote", emailController.sendQuoteEmail);

export default router;
