import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { forgotPasswordEmail } from "./emailTemplate.js";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (email, otp) => {
  // Pass the 6-digit OTP to the template
  const emailTemplate = forgotPasswordEmail(otp);

  const mailOptions = {
    from: `"KineticOS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
  };

  await transporter.sendMail(mailOptions);
};