import emailService from "../services/emailService.js";

/**
 * Email controller - handles email-related HTTP requests
 */
class EmailController {
  /**
   * Handle contact form submission
   * POST /api/v1/email/contact
   */
  async sendContactEmail(req, res, next) {
    try {
      const { name, email, message } = req.body;

      // Basic validation
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and message are required",
        });
      }

      // Send email via service
      await emailService.sendContactEmail({ name, email, message });

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
  async sendQuoteEmail(req, res, next) {
    try {
      const { firstName, lastName, email, phone, country, productName, note } =
        req.body;

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
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending quote email:", error);
      next(error);
    }
  }
}

export default new EmailController();
