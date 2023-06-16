import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { verifyOwner } from "../middleware/profile.js";
import { viewRequests } from "../controllers/requests.js";

const router = express.Router();

router.get("/view/:email", verifyToken, verifyOwner, viewRequests);

export default router;
