import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../../../../../.env" });
import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
} as SMTPTransport.Options);

// Render an EJS email template
const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    path.join(
      process.cwd(),
      "auth-service",
      "src",
      "utils",
      "email-templates",
      `${templateName}.ejs`
    )
  );
  return ejs.renderFile(templatePath, data);
};

// send an email using the nodemailer
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  const html = await renderEmailTemplate(templateName, data);

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
    return info;
  } catch (error) {
    console.log("Error sending email: ", error);
    return false;
  }
};
