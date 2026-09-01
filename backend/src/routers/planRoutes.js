import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// POST /api/plan/send-grocery-email
router.post("/send-grocery-email", async (req, res) => {
  try {
    const { email, athleteName, groceryText } = req.body;

    if (!email || !groceryText) {
      return res.status(400).json({
        success: false,
        message: "Recipient email and grocery list text are required.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 16-character App Password
      },
    });

    const mailOptions = {
      from: `"KineticOS Protocol" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🛒 7-Day Grocery Protocol - ${athleteName || "Athlete"}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; color: #0f172a;">
          <h2 style="margin-top: 0; color: #7c3aed;">KineticOS Smart Grocery Protocol</h2>
          <p style="color: #64748b; font-size: 14px;">Personalized for <strong>${athleteName || "Athlete"}</strong></p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.6; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">${groceryText}</pre>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">KineticOS Biometric Intelligence Protocol</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({
      success: true,
      message: "Grocery list sent successfully!",
    });
  } catch (error) {
    console.error("Mail dispatch error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to dispatch email.",
    });
  }
});

export default router;