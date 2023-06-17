import { pool } from "../db.js";

export const viewRequests = async (req, res) => {
  try {
    const email = req.params.email;

    const requestQuery =
      "SELECT * FROM connections WHERE (user1id=$1 OR user2id=$1) AND cstate='pending'";
    const requestValues = [email];
    const { rows } = await pool.query(requestQuery, requestValues);

    if (rows.length === 0) {
      res.status(404).json({ message: "No requests found" });
    }

    res.status(200).json({ requests: rows });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
