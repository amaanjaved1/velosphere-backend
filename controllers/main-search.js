import { pool } from "../db.js";

export const search = async (req, res) => {
  try {
    const filter = req.params.filterBy;
    const content = req.params.content;

    const searchQuery = "SELECT * FROM users WHERE $1=$2";
    const searchValues = [filter, content];
    const { rows } = await pool.query(searchQuery, searchValues);

    if (rows.length === 0) {
      res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ users: rows });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
