import { pool } from "../db.js";

export const search = async (req, res) => {
  try {
    // What can I search by: username, firstName, lastName, email, studentProgram, company, internposition, educationalInstitution, schoolProgram, studentLocation, oenofthe4tags, internTeam
    // What can I filter by: currentterm
    const searchBy = req.params.searchBy;
    const filterBy = req.params.filterBy;
    const content = req.params.content;

    const conditional = "";
    if (filterBy === "null") {
      conditional = `AND currentTerm = ${filterBy}`;
    }

    const searchQuery = `SELECT * FROM users WHERE ${searchBy} LIKE $1 ${conditional}`;
    const searchValues = [`%${content}%`];
    const { rows } = await pool.query(searchQuery, searchValues);

    if (rows.length === 0) {
      res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({ searchResults: rows });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};
