import express from "express";
import Mailgun from "mailgun.js";
import formData from "form-data";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// For sending emails using Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "info@flexussolutions.com",
  key: process.env.MAILGUN_API_KEY,
});

app.post(`/api/${process.env.API_VERSION}/send-email`, async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Flexus Website <mail@${process.env.MAILGUN_DOMAIN}>`,
      to: "info@flexussolutions.com",
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color:#006c43;">New Contact Form Submission</h2>
          
          <table style="width:100%; border-collapse: collapse;">
            <tr>
              <td style="padding:10px; font-weight:bold;">Name:</td>
              <td style="padding:10px;">${name}</td>
            </tr>
            <tr style="background:#f9f9f9;">
              <td style="padding:10px; font-weight:bold;">Email:</td>
              <td style="padding:10px;">${email}</td>
            </tr>
            <tr>
              <td style="padding:10px; font-weight:bold;">Message:</td>
              <td style="padding:10px;">${message}</td>
            </tr>
          </table>

          <p style="margin-top:20px; font-size:12px; color:#888;">
            Sent from Flexus Solutions website contact form.
          </p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Email failed to send" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .json({ error: "Route not found", code: "NOT_FOUND", status: 404 });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    code: err.code || "INTERNAL_ERROR",
    status: err.status || 500,
  });
});

// Start server (skip in test environment)
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

export default app;
