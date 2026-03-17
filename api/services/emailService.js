import { transporter, COMPANY_EMAIL, FROM_NAME } from "../config/mail.js";

/**
 * Email service for sending various types of emails
 */
class EmailService {
  /**
   * Send contact form email
   * @param {Object} data - Contact form data
   * @param {string} data.name - Sender's name
   * @param {string} data.email - Sender's email
   * @param {string} data.message - Message content
   * @param {string} data.cc - CC recipients (comma-separated)
   */
  async sendContactEmail({ name, email, message, cc }) {
    const emailData = {
      from: `${FROM_NAME} <${COMPANY_EMAIL}>`,
      to: COMPANY_EMAIL,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: this._generateContactEmailTemplate({ name, email, message }),
    };

    if (cc) {
      emailData.cc = cc;
    }

    return await transporter.sendMail(emailData);
  }

  /**
   * Send quote request email
   * @param {Object} data - Quote request data
   * @param {string} data.firstName - Customer's first name
   * @param {string} data.lastName - Customer's last name
   * @param {string} data.email - Customer's email
   * @param {string} data.phone - Customer's phone with country code
   * @param {string} data.country - Customer's country
   * @param {string} data.productName - Product name
   * @param {string} data.note - Additional note (optional)
   * @param {string} data.cc - CC recipients (comma-separated)
   */
  async sendQuoteEmail({
    firstName,
    lastName,
    email,
    phone,
    country,
    productName,
    note,
    cc,
  }) {
    const emailData = {
      from: `${FROM_NAME} <${COMPANY_EMAIL}>`,
      to: COMPANY_EMAIL,
      replyTo: email,
      subject: `New Quote Request for ${productName} - ${firstName} ${lastName}`,
      html: this._generateQuoteEmailTemplate({
        firstName,
        lastName,
        email,
        phone,
        country,
        productName,
        note,
      }),
    };

    if (cc) {
      emailData.cc = cc;
    }

    return await transporter.sendMail(emailData);
  }

  /**
   * Generate HTML template for contact form emails
   * @private
   */
  _generateContactEmailTemplate({ name, email, message }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 650px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #006c43 0%, #80b940 100%); padding: 30px 40px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
              💬 New Contact Message
            </h1>
            <p style="margin: 10px 0 0 0; color: #e8f5e9; font-size: 16px;">
              A visitor has reached out through your website
            </p>
          </div>

          <!-- Sender Badge -->
          <div style="background-color: #f8fdf9; padding: 20px 40px; border-bottom: 3px solid #80b940;">
            <div style="background-color: #ffffff; border: 2px solid #006c43; border-radius: 8px; padding: 15px 20px; text-align: center;">
              <div style="color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">
                From
              </div>
              <div style="color: #006c43; font-size: 20px; font-weight: 700;">
                ${name}
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div style="padding: 30px 40px;">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
              📋 Sender Information
            </h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
                  <div style="display: flex; align-items: center;">
                    <div style="min-width: 120px; color: #666; font-weight: 600; font-size: 14px;">
                      👤 Name:
                    </div>
                    <div style="color: #333; font-size: 15px; font-weight: 500;">
                      ${name}
                    </div>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
                  <div style="display: flex; align-items: center;">
                    <div style="min-width: 120px; color: #666; font-weight: 600; font-size: 14px;">
                      ✉️ Email:
                    </div>
                    <div>
                      <a href="mailto:${email}" style="color: #006c43; text-decoration: none; font-size: 15px; font-weight: 500;">
                        ${email}
                      </a>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Message Section -->
          <div style="padding: 0 40px;">
            <h2 style="margin: 20px 0 15px 0; color: #333; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
              📝 Message
            </h2>
            
            <div style="background-color: #f8fdf9; border-left: 4px solid #80b940; padding: 20px; border-radius: 4px; color: #333; font-size: 15px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word;">
              ${message}
            </div>
          </div>

          <!-- Call to Action -->
          <div style="padding: 30px 40px;">
            <div style="background: linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 100%); border-radius: 8px; padding: 20px; text-align: center; border: 1px solid #80b940;">
              <p style="margin: 0 0 15px 0; color: #555; font-size: 15px;">
                🎯 <strong>Action Required:</strong> Respond to this message
              </p>
              <a href="mailto:${email}?subject=Re:%20Your%20Contact%20Message" 
                 style="display: inline-block; background-color: #006c43; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 15px; transition: background-color 0.3s;">
                📧 Reply to Sender
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f8f8; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0; font-size: 12px; color: #888; line-height: 1.6;">
              This message was sent from the Flexus Solutions website contact form.<br>
              Timestamp: ${new Date().toLocaleString("en-US", { timeZone: "UTC", dateStyle: "full", timeStyle: "long" })}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML template for quote request emails
   * @private
   */
  _generateQuoteEmailTemplate({
    firstName,
    lastName,
    email,
    phone,
    country,
    productName,
    note,
  }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 650px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #006c43 0%, #80b940 100%); padding: 30px 40px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
              📋 New Quote Request
            </h1>
            <p style="margin: 10px 0 0 0; color: #e8f5e9; font-size: 16px;">
              A customer is interested in your product
            </p>
          </div>

          <!-- Product Badge -->
          <div style="background-color: #f8fdf9; padding: 20px 40px; border-bottom: 3px solid #80b940;">
            <div style="background-color: #ffffff; border: 2px solid #006c43; border-radius: 8px; padding: 15px 20px; text-align: center;">
              <div style="color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">
                Product Requested
              </div>
              <div style="color: #006c43; font-size: 20px; font-weight: 700;">
                ${productName}
              </div>
            </div>
          </div>

          <!-- Customer Information -->
          <div style="padding: 30px 40px;">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 600; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">
              📋 Customer Information
            </h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="min-width: 140px; color: #666; font-weight: 600; font-size: 14px;">
                      👤 Full Name:
                    </div>
                    <div style="color: #333; font-size: 15px; font-weight: 500;">
                      ${firstName} ${lastName}
                    </div>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="min-width: 140px; color: #666; font-weight: 600; font-size: 14px;">
                      ✉️ Email:
                    </div>
                    <div>
                      <a href="mailto:${email}" style="color: #006c43; text-decoration: none; font-size: 15px; font-weight: 500;">
                        ${email}
                      </a>
                    </div>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="min-width: 140px; color: #666; font-weight: 600; font-size: 14px;">
                      📞 Phone:
                    </div>
                    <div>
                      <a href="tel:${phone}" style="color: #006c43; text-decoration: none; font-size: 15px; font-weight: 500;">
                        ${phone}
                      </a>
                    </div>
                  </div>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
                  <div style="display: flex; align-items: flex-start;">
                    <div style="min-width: 140px; color: #666; font-weight: 600; font-size: 14px;">
                      🌍 Country:
                    </div>
                    <div style="color: #333; font-size: 15px; font-weight: 500;">
                      ${country}
                    </div>
                  </div>
                </td>
              </tr>
              
              ${
                note
                  ? `
              <tr>
                <td style="padding: 15px 0;">
                  <div style="margin-bottom: 8px; color: #666; font-weight: 600; font-size: 14px;">
                    💬 Additional Note:
                  </div>
                  <div style="background-color: #f8fdf9; border-left: 4px solid #80b940; padding: 15px; border-radius: 4px; color: #333; font-size: 14px; line-height: 1.6;">
                    ${note}
                  </div>
                </td>
              </tr>
              `
                  : ""
              }
            </table>

            <!-- Call to Action -->
            <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 100%); border-radius: 8px; text-align: center; border: 1px solid #80b940;">
              <p style="margin: 0 0 15px 0; color: #555; font-size: 15px;">
                🎯 <strong>Action Required:</strong> Respond to this quote request promptly
              </p>
              <a href="mailto:${email}?subject=Quote%20for%20${encodeURIComponent(productName)}" 
                 style="display: inline-block; background-color: #006c43; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 15px; transition: background-color 0.3s;">
                📧 Reply to Customer
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8f8f8; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0; font-size: 12px; color: #888; line-height: 1.6;">
              This quote request was sent from the Flexus Solutions website.<br>
              Timestamp: ${new Date().toLocaleString("en-US", { timeZone: "UTC", dateStyle: "full", timeStyle: "long" })}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
