import { pool } from "../db.js";

export const connectionStatus = async (req, res, actionFrom, actionTo) => {
  try {
    const connectionQuery =
      "SELECT * FROM connections WHERE (user1id=$1 AND user2id=$2) OR (user1id=$2 AND user2id=$1)";
    const connectionValues = [actionFrom, actionTo];
    const { rows } = await pool.query(connectionQuery, connectionValues);

    if (rows.length === 0) {
      return ["not connected", false];
    } else {
      return [rows[0].cstate, rows[0].sentby];
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
