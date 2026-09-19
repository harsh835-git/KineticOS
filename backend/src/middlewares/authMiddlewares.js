import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Verify matching casing with your actual file name

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trimStart();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Contains { userId: ... }
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

// Middleware to check if the authenticated user has an 'admin' role
export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const user = await User.findById(req.user.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access Denied. Admin privileges required." });
    }

    next();
  } catch (error) {
    console.error("Admin Role Check Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error verifying admin status." });
  }
};