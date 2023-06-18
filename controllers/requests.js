import { pool } from "../db.js";

export const viewRequests = async (req, res) => {
  try {
    const email = req.params.email;
    const actionFrom = req.body.actionFrom;

    // Check to see if the user exists

    const userQuery = "SELECT * FROM users WHERE email=$1";
    const userValues = [email];
    const userResult = await pool.query(userQuery, userValues);

    if (userResult.rowCount === 0) {
      res.status(404).json({ message: "User not found" });
    }

    if (email !== actionFrom) {
      res.status(403).json({ message: "Unauthorized" });
    }

    const requestQuery =
      "SELECT * FROM connections WHERE (user1id=$1 OR user2id=$1) AND cstate='pending' AND NOT sentby=$1";
    const requestValues = [email];
    const { rows } = await pool.query(requestQuery, requestValues);

    res.status(200).json({ requests: rows });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
