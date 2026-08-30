import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/emailService.js";
import User from "../models/user.js";

// ====================== REGISTER ======================
export const userRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Case-insensitive query to ensure duplicates are always detected
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered. Please log in instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isOnboarded: false,
    });

    // Generate token so the newly registered user is authenticated
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isOnboarded: false,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // Catch MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered. Please log in instead.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
};

// ================= LOGIN =================
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered.",
      });
    }

    // Guard against users created with OAuth who might not have a password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was registered using Google. Please use Google to sign in.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isOnboarded: Boolean(user.isOnboarded),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetOtp = hashedOtp;
    user.resetOtpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();
    await sendOtpEmail(user.email, otp);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send verification code.",
    });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();
    const hashedOtp = crypto.createHash("sha256").update(cleanOtp).digest("hex");

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, "i") },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.resetOtp || user.resetOtp !== hashedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    const expiryTime = new Date(user.resetOtpExpire).getTime();
    const currentTime = Date.now();

    if (!user.resetOtpExpire || currentTime > expiryTime) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpire = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password.",
    });
  }
};

// ================= GOOGLE AUTH =================
export const googleAuth = async (req, res) => {
  try {
    const { credential, email: clientEmail, name: clientName } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google credential token missing",
      });
    }

    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${credential}` },
      }
    );

    if (!googleRes.ok) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Google token",
      });
    }

    const payload = await googleRes.json();
    const email = (payload.email || clientEmail || "").toLowerCase().trim();
    const name = payload.name || clientName || "Google User";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Could not retrieve email from Google account",
      });
    }

    let user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        name,
        email,
        isOnboarded: false,
      });
      isNewUser = true;
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: isNewUser
        ? "Account created via Google."
        : "Google sign-in successful.",
      isNewUser,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isOnboarded: Boolean(user.isOnboarded),
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Google authentication failed",
    });
  }
};