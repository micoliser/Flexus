import express from "express";
import EmailController from "../controllers/emailController.js";

const router = express.Router();

// POST /api/v1/email/contact
router.post("/contact", EmailController.sendContactEmail);

// POST /api/v1/email/quote
router.post("/quote", EmailController.sendQuoteEmail);

export default router;
