import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { verifyOwner } from "../middleware/profile.js";
import {
  getProfileFull,
  updateProfile,
  sendConnection,
  removeConnection,
  acceptConnection,
  denyConnection,
  cancelConnection,
} from "../controllers/profile.js";

const router = express.Router();

// Endpoint to get the full profile of a user
router.post("/:email", verifyToken, getProfileFull);

// Endpoint to update the profile of a user
router.put("/update/:email", verifyToken, verifyOwner, updateProfile);

// Endpoint to send a connection request
router.post(
  "/send-connection/:email",
  verifyToken,
  verifyOwner,
  sendConnection
);

// Endpoint to accept a received connection request
router.post(
  "/accept-connection/:email",
  verifyToken,
  verifyOwner,
  acceptConnection
);

// Endpoint to cancel a sent connection request
router.delete(
  "/cancel-connection/:email",
  verifyToken,
  verifyOwner,
  cancelConnection
);

// Endpoint to deny a received connection request
router.delete(
  "/deny-connection/:email",
  verifyToken,
  verifyOwner,
  denyConnection
);

// Endpoint to remove a connection
router.delete(
  "/remove-connection/:email",
  verifyToken,
  verifyOwner,
  removeConnection
);

export default router;
