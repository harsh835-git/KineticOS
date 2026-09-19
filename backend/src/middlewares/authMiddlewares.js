import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No authentication token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB to verify current status
    const user = await User.findById(decoded.userId || decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User account no longer exists." });
    }

    // --- REJECT CURRENT ACTIVE SESSIONS IF BLOCKED ---
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended by an administrator.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired session token." });
  }
};

// Middleware to check if the authenticated user has an 'admin' role
export const verifyAdmin = (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access Denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Role Check Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error verifying admin status.",
    });
  }
};