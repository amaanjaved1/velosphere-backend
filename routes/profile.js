import express from "express";
import { pool } from "../db.js";
import { verifyToken } from "../middleware/auth.js";
import {
  getProfileFull,
  updateProfile,
  sendConnection,
  removeConnection,
  acceptConnection,
  denyConnection,
  cancelConnection,
} from "../controllers/profile.js";
import { verifyOwner } from "../middleware/profile.js";

const router = express.Router();

// Endpoint to get the full profile of a user
router.get("/profile/:email", verifyToken, verifyOwner, getProfileFull);

// Endpoint to update the profile of a user
router.put("/profile/:email", verifyToken, verifyOwner, updateProfile);

// Endpoint to send a connection request
router.put(
  "/profile/send-connection/:email",
  verifyToken,
  verifyOwner,
  sendConnection
);

// Endpoint to accept a received connection request
router.put(
  "/profile/accept-connection/:email",
  verifyToken,
  verifyOwner,
  acceptConnection
);

// Endpoint to deny a received connection request
router.put(
  "/profile/deny-connection/:email",
  verifyToken,
  verifyOwner,
  denyConnection
);

// Endpoint to cancel a sent connection request
router.put(
  "/profile/cancel-connection/:email",
  verifyToken,
  verifyOwner,
  cancelConnection
);

// Endpoint to remove a connection
router.put(
  "/profile/remove-connection/:email",
  verifyToken,
  verifyOwner,
  removeConnection
);

export default router;
