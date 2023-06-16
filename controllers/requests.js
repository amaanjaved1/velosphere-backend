import { pool } from "../db.js";

export const viewRequests = async (req, res) => {
  try {
    // implementation here
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
