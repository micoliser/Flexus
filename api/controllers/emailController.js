import emailService from "../services/emailService.js";
import LogService from "../services/logService.js";

/**
 * Email controller - handles email-related HTTP requests
 */
class EmailController {
  /**
   * Handle contact form submission
   * POST /api/v1/email/contact
   */
  static async sendContactEmail(req, res, next) {
    try {
      const { name, email, message, cc } = req.body;

      // Basic validation
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and message are required",
        });
      }

      // Send email via service
      await emailService.sendContactEmail({ name, email, message, cc });

      await LogService.createLog({
        action: "email.contact",
        entityType: "email",
        message: `Contact email submitted by ${email}`,
        actorName: name,
        actorEmail: email,
        status: "success",
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending contact email:", error);
      next(error);
    }
  }

  /**
   * Handle quote request submission
   * POST /api/v1/email/quote
   */
  static async sendQuoteEmail(req, res, next) {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        country,
        productName,
        note,
        cc,
      } = req.body;

      // Basic validation
      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !country ||
        !productName
      ) {
        return res.status(400).json({
          success: false,
          message:
            "First name, last name, email, phone, country, and product name are required",
        });
      }

      // Send email via service
      await emailService.sendQuoteEmail({
        firstName,
        lastName,
        email,
        phone,
        country,
        productName,
        note,
        cc,
      });

      await LogService.createLog({
        action: "email.quote",
        entityType: "email",
        message: `Quote request for \"${productName}\" submitted by ${email}`,
        actorName: `${firstName} ${lastName}`,
        actorEmail: email,
        status: "success",
        metadata: {
          productName,
          country,
          phone,
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending quote email:", error);
      next(error);
    }
  }
}

export default EmailController;
