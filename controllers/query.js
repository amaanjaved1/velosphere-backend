import { pool } from "../db.js";
import { connectionStatus } from "./profile.js";

export const mainResults = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const offset = (page - 1) * limit;

  const results = {};

  try {
    const totalCountQuery = "SELECT COUNT(*) FROM users;";
    const totalCountResult = await pool.query(totalCountQuery);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    const dataQuery = "SELECT * FROM users LIMIT $1 OFFSET $2;";
    const dataParams = [limit, offset];
    const dataResult = await pool.query(dataQuery, dataParams);
    const data = dataResult.rows;

    if (offset + limit < totalCount) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (offset > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.results = data;

    results.totalPages = Math.ceil(totalCount / limit);

    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const searchResults = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const offset = (page - 1) * limit;

    const searchBy = req.params.searchBy;
    const filterBy = req.params.filterBy;
    const content = req.params.content;
    const results = {};

    let searchQuery = `
      SELECT * FROM users
      WHERE ${searchBy} LIKE $1 AND currentTerm = $2
      LIMIT $3 OFFSET $4;
    `;

    let searchValues = [`%${content}%`, filterBy, limit, offset];

    if (filterBy === "null") {
      searchQuery = `
        SELECT * FROM users
        WHERE ${searchBy} LIKE $1
        LIMIT $2 OFFSET $3;
        `;
      searchValues = [`%${content}%`, limit, offset];
    }

    const { rows } = await pool.query(searchQuery, searchValues);

    if (rows.length === 0) {
      res.status(404).json({ message: "No users found" });
    }

    let totalCountQuery = `
        SELECT COUNT(*) FROM users
        WHERE ${searchBy} LIKE $1 AND currentTerm = $2;
        `;
    let totalCountValues = [`%${content}%`, filterBy];

    if (filterBy === "null") {
      totalCountQuery = `SELECT COUNT(*) FROM users
        WHERE ${searchBy} LIKE $1;`;
      totalCountValues = [`%${content}%`];
    }

    const totalCountResult = await pool.query(
      totalCountQuery,
      totalCountValues
    );
    const totalCount = parseInt(totalCountResult.rows[0].count);

    if (offset + limit < totalCount) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (offset > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.results = rows;

    results.totalPages = Math.ceil(totalCount / limit);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const connectionResults = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const email = req.params.email;

  // Check to see if the user exists
  const emailQuery = "SELECT * FROM users WHERE email = $1";
  const emailValues = [email];
  const result = await pool.query(emailQuery, emailValues);

  if (result.rows.length === 0) {
    return res.status(401).json({ message: "User does not exist" });
  }

  const offset = (page - 1) * limit;

  const results = {};

  try {
    // Get the data
    const dataQuery = `
        SELECT * FROM connections
        WHERE (user1id=$1 OR user2id=$1) AND cstate='accepted'
        LIMIT $2 OFFSET $3;
        `;
    const dataValues = [email, limit, offset];
    const dataResult = await pool.query(dataQuery, dataValues);
    const data = dataResult.rows;

    // Get the total count
    const totalCountQuery =
      "SELECT COUNT(*) FROM connections WHERE (user1id=$1 OR user2id=$1) AND cstate='accepted'";
    const totalCountValues = [email];
    const totalCountResult = await pool.query(
      totalCountQuery,
      totalCountValues
    );
    const totalCount = parseInt(totalCountResult.rows[0].count);

    if (offset + limit < totalCount) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (offset > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.content = data;

    results.totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ results: results });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const requestResults = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const email = req.params.email;

  // Check to see if the user exists

  const userQuery = "SELECT * FROM users WHERE email=$1";
  const userValues = [email];
  const userResult = await pool.query(userQuery, userValues);

  if (userResult.rowCount === 0) {
    res.status(404).json({ message: "User not found" });
  }

  const offset = (page - 1) * limit;

  const results = {};

  try {
    // Get the data
    const dataQuery = `
        SELECT * FROM connections
        WHERE (user1id=$1 OR user2id=$1) AND cstate='pending'
        AND NOT sentby=$1
        LIMIT $2 OFFSET $3;
        `;
    const dataValues = [email, limit, offset];
    const dataResult = await pool.query(dataQuery, dataValues);
    const data = dataResult.rows;

    // Get the total count
    const totalCountQuery =
      "SELECT COUNT(*) FROM connections WHERE (user1id=$1 OR user2id=$1) AND cstate='pending' AND NOT sentby=$1";
    const totalCountValues = [email];
    const totalCountResult = await pool.query(
      totalCountQuery,
      totalCountValues
    );
    const totalCount = parseInt(totalCountResult.rows[0].count);

    if (offset + limit < totalCount) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (offset > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.content = data;

    results.totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ results: results });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
