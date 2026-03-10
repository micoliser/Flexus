import Mailgun from "mailgun.js";
import formData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "info@flexussolutions.com",
  key: process.env.MAILGUN_API_KEY,
});

export { mg };
export const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
export const COMPANY_EMAIL = "info@flexussolutions.com";
