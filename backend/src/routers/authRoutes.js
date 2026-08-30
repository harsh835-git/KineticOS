import express from "express";

import  {userRegister,userLogin,forgotPassword,resetPassword ,googleAuth} from "../controllers/authController.js"
const router = express.Router();

router.post("/register",userRegister);
router.post("/login",userLogin);

router.post("/forgot-password",forgotPassword);

router.post("/reset-password-otp",resetPassword);
router.post("/google", googleAuth);

export default router;
