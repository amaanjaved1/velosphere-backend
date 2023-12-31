import express from "express";
import {
  searchResults,
  connectionResults,
  requestResults,
  mainResultsCached,
} from "../controllers/query.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/mainreg", (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  req.query.page = page; // Assign the parsed value back to req.query
  req.query.limit = limit; // Assign the parsed value back to req.query
  mainResults(req, res);
});

router.get("/search/:searchBy/:content", verifyToken, (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  req.query.page = page; // Assign the parsed value back to req.query
  req.query.limit = limit; // Assign the parsed value back to req.query
  searchResults(req, res);
});

router.get("/connections/:email", verifyToken, (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  req.query.page = page; // Assign the parsed value back to req.query
  req.query.limit = limit; // Assign the parsed value back to req.query
  connectionResults(req, res);
});

router.get("/requests/:email", verifyToken, (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  req.query.page = page; // Assign the parsed value back to req.query
  req.query.limit = limit; // Assign the parsed value back to req.query
  requestResults(req, res);
});

router.get("/main", (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  req.query.page = page; // Assign the parsed value back to req.query
  req.query.limit = limit; // Assign the parsed value back to req.query
  mainResultsCached(req, res);
});

export default router;
