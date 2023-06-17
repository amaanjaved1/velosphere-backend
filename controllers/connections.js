import { pool } from "../db.js";

const getConnections = async (req, res) => {
  try {
    const email = req.params.email;

    const connectionQuery =
      "SELECT * FROM connections WHERE (user1id=$1 OR user2id=$1) AND cstate='connected'";
    const connectionValues = [email];
    const { rows } = await pool.query(connectionQuery, connectionValues);

    if (rows.length === 0) {
      res.status(404).json({ message: "No connections found" });
    }

    res.status(200).json({ connections: rows });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
