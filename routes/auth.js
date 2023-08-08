import express from "express";
import {
  login,
  register,
  forgotPassword,
  confirmPasswordChange,
} from "../controllers/auth.js";

// Creates a modular, mountable set of routes
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.get("/confirm-password-change/:token", confirmPasswordChange);

export default router;
