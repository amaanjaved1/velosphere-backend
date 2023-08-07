import { pool } from "../db.js";
// import { redisClient } from "../index.js";

const DEFAULT_EXPIRATION = 1200;

export const mainResults = async (req, res) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const offset = (page - 1) * limit;

  const results = {};

  try {
    const totalCountQuery = "SELECT COUNT(*) FROM users;";
    const totalCountResult = await pool.query(totalCountQuery);
    const totalCount = parseInt(totalCountResult.rows[0].count);

    const dataQuery =
      "SELECT internposition, company, currentterm, firstname, lastname, studentprogram, studentlocation, educationalinstitution, email FROM users LIMIT $1 OFFSET $2;";
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

    results.content = data;

    results.totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ results: results });
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
    const content = req.params.content;
    const results = {};

    console.log(searchBy);

    let searchQuery = `
  SELECT * FROM users
  WHERE LOWER(${searchBy}) LIKE ('%${content}%')
  LIMIT $1 OFFSET $2;
`;

    let searchValues = [limit, offset];

    const { rows } = await pool.query(searchQuery, searchValues);

    let totalCountQuery = `
  SELECT COUNT(*) FROM users
  WHERE LOWER(${searchBy}) LIKE ('%${content}%');
`;

    let totalCountValues = [];

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

    results.content = rows;

    results.totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ results: results });
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

const getCountResults = () => {
  return new Promise((resolve, reject) => {
    redisClient.get("countResults", (error, data) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        resolve(parseInt(data) || 0);
      }
    });
  });
};

export const mainResultsCached = async (req, res) => {
  try {
    const cachedData = await new Promise((resolve, reject) => {
      redisClient.get("mainResults", (error, data) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(data);
        }
      });
    });

    let queryData = {};

    if (cachedData != null) {
      queryData = JSON.parse(cachedData);
    } else {
      const dataQuery =
        "SELECT internposition, company, currentterm, firstname, lastname, studentprogram, studentlocation, educationalinstitution, email FROM users;";
      const dataParams = [];
      const dataResult = await pool.query(dataQuery, dataParams);
      const results = dataResult.rows;
      redisClient.setex(
        "mainResults",
        DEFAULT_EXPIRATION,
        JSON.stringify(results)
      );
      redisClient.setex("countResults", DEFAULT_EXPIRATION, results.length);
      queryData = results;
      totalCount = results.length;
    }

    const totalCount = await getCountResults();

    let results = {};

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    let offset = (page - 1) * limit;

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

    // Get data

    const data = queryData.slice(offset, offset + limit);

    results.content = data;

    results.totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({ results: results });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
