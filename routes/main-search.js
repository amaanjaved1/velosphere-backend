import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { search } from "../controllers/main-search.js";

const router = express.Router();

router.get("/search/:filterBy/:content", verifyToken, search);

export default router;
