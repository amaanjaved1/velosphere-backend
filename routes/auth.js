import express from "express";
import { login, register, logout, confirmEmail } from "../controllers/auth.js";
import { verifyToken } from "../middleware/auth.js";

// Creates a modular, mountable set of routes
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", verifyToken, logout);
// Create a waiting screen after registration, waiting for the user to confirm their email
router.post("/confirm-email/:token", confirmEmail);

export default router;
