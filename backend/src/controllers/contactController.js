import { Resend } from "resend";
import ContactMessage from "../models/contactMessage.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email and message are required." });
    }

    // 1. Save backup copy in MongoDB
    await ContactMessage.create({ name, email, subject, message });

    // 2. Dispatch email to your personal email via Resend
    const data = await resend.emails.send({
      from: "KineticOS Support <onboarding@resend.dev>",
      to: ["harshdeveloper83@gmail.com"],
      subject: `[KineticOS Inquiry] ${subject || "New Message from " + name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #09090b; border-radius: 12px; color: #f4f4f5; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255, 255, 255, 0.1);">
          
          
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #a78bfa; margin: 0; font-size: 20px; font-weight: bold;">New Contact Form Query</h2>
            <span style="background: rgba(124, 58, 237, 0.2); color: #c4b5fd; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase;">Inquiry</span>
          </div>

          
          <div style="background: #18181b; padding: 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a1a1aa;"><strong>From Name:</strong> <span style="color: #ffffff;">${name}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #a1a1aa;"><strong>From Email:</strong> <a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a></p>
            <p style="margin: 0; font-size: 13px; color: #a1a1aa;"><strong>Subject:</strong> <span style="color: #ffffff;">${subject || "None"}</span></p>
          </div>

          
          <div style="margin-bottom: 24px;">
            <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #71717a; margin-bottom: 8px; font-weight: bold;">Message Content</p>
            <div style="background: #18181b; padding: 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 14px; line-height: 1.6; color: #e4e4e7; white-space: pre-wrap;">${message}</div>
          </div>

          
          <div style="display: flex; gap: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'KineticOS Inquiry')}" 
               style="background-color: #7c3aed; color: #ffffff; padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: bold; text-decoration: none; display: inline-block;">
               Reply Directly
            </a>
            <a href="http://localhost:5173/dashboard" 
               style="background-color: rgba(255, 255, 255, 0.05); color: #d4d4d8; border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: bold; text-decoration: none; display: inline-block;">
               Open Dashboard
            </a>
          </div>

        </div>
      `,
    });

    return res.status(200).json({ success: true, message: "Query sent successfully.", data });
  } catch (error) {
    console.error("Email Dispatch Error:", error);
    return res.status(500).json({ success: false, message: "Failed to dispatch email." });
  }
};