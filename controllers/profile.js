import { pool } from "../db.js";

export const getProfileFull = async (req, res) => {
  try {
    const actionFrom = req.body.actionFrom;
    const actionTo = req.params.email;

    const emailQuery = "SELECT * FROM users WHERE email = $1";
    const emailValues = [actionTo];
    const { rows } = await pool.query(emailQuery, emailValues);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const user = rows[0];

    let isMyProfile = actionFrom === actionTo;

    let cstate = false;

    if (!isMyProfile) {
      const result = await connectionStatus(req, res, actionFrom, actionTo);
      cstate = result.cstate;
    }

    const values = {
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      company: user.company,
      studentProgram: user.studentprogram,
      studentLocation: user.studentlocation,
      educationalInstitution: user.educationalinstitution,
      schoolProgram: user.schoolprogram,
      meInOneSentence: user.meinonesentence,
      github: user.github,
      linkedin: user.linkedin,
      twitter: user.twitter,
      facebook: user.facebook,
      profilePicture: user.profilepicture,
      meInFourTags1: user.meinfourtags1,
      meInFourTags2: user.meinfourtags2,
      meInFourTags3: user.meinfourtags3,
      meInFourTags4: user.meinfourtags4,
      internPosition: user.internposition,
      internTeam: user.internteam,
      currentTerm: user.currentterm,
      pastTerms: user.pastterms,
      isMyProfile: isMyProfile,
      cstate: cstate,
    };

    res.status(200).json(values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const actionFrom = req.body.actionFrom;
    const actionTo = req.params.email;

    if (actionFrom !== actionTo) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const fieldsToUpdate = req.body.fieldsToUpdate;

    const setClause = Object.keys(fieldsToUpdate)
      .map((key, index) => {
        return `${key} = $${index + 2}`; // Use numbered placeholders
      })
      .join(", ");

    const updateQuery = `UPDATE users SET ${setClause} WHERE email = $1`;

    const updateValues = [actionTo, ...Object.values(fieldsToUpdate)];

    await pool.query(updateQuery, updateValues);

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendConnection = async (req, res) => {
  try {
    // Get users: actionFrom, actionTo
    const actionFrom = req.body.actionFrom;
    const actionTo = req.params.email;

    // Check if actionFrom and actionTo are the same
    if (actionFrom === actionTo) {
      return res.status(401).json({ message: "Cannot connect with yourself" });
    }

    // Check if actionTo exists
    const emailQuery = "SELECT * FROM users WHERE email = $1";
    const emailValues = [actionTo];
    const { rows } = await pool.query(emailQuery, emailValues);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User does not exist" });
    }

    // Check if connection already exists
    const cstate = await connectionStatus(req, res, actionFrom, actionTo);

    if (cstate[0] !== false) {
      return res.status(401).json({ message: "Connection already exists" });
    }

    // Create connection
    const createConnectionQuery = `INSERT INTO connections (user1id, user2id, cstate, sentby) VALUES ($1, $2, $3, $1)`;
    const createConnectionValues = [actionFrom, actionTo, "pending"];
    await pool.query(createConnectionQuery, createConnectionValues);

    res.status(200).json({ message: "Connection sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeConnection = async (req, res) => {
  try {
    // Get users: actionFrom, actionTo
    const actionFrom = req.body.actionFrom;
    const actionTo = req.params.email;

    // Check if actionFrom and actionTo are the same
    if (actionFrom === actionTo) {
      return res.status(401).json({ message: "Cannot remove yourself" });
    }

    // Check if actionTo exists
    const emailQuery = "SELECT * FROM users WHERE email = $1";
    const emailValues = [actionTo];
    const { rows } = await pool.query(emailQuery, emailValues);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User does not exist" });
    }

    // Check if connection exists
    const cstate = await connectionStatus(req, res, actionFrom, actionTo);

    if (cstate[0] === false) {
      return res.status(401).json({ message: "Connection does not exist" });
    }

    // Check to see if connection is pending

    if (cstate[0] === "pending") {
      return res
        .status(401)
        .json({ message: "Connection is pending, cannot remove" });
    }

    // Remove connection
    const removeConnectionQuery = `DELETE FROM connections WHERE (user1id = $1 AND user2id = $2) OR (user1id = $2 AND user2id = $1)`;
    const removeConnectionValues = [actionFrom, actionTo];
    await pool.query(removeConnectionQuery, removeConnectionValues);

    res.status(200).json({ message: "Connection removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const acceptConnection = async (req, res) => {
  try {
    // Get users: actionFrom, actionTo
    const actionFrom = req.body.actionFrom;
    const actionTo = req.params.email;

    // Check if actionFrom and actionTo are the same
    if (actionFrom === actionTo) {
      return res.status(401).json({ message: "Cannot add yourself" });
    }

    // Check if actionTo exists
    const emailQuery = "SELECT * FROM users WHERE email = $1";
    const emailValues = [actionTo];
    const { rows } = await pool.query(emailQuery, emailValues);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User does not exist" });
    }

    // Check if connection exists
    const cstate = await connectionStatus(req, res, actionFrom, actionTo);

    if (cstate[0] === false) {
      return res.status(401).json({ message: "Connection does not exist" });
    }

    // Check to see if connection is already accepted

    if (cstate[0] === "accepted") {
      return res
        .status(401)
        .json({ message: "Connection is already accepted" });
    }

    if (cstate[1] === actionFrom) {
      return res
        .status(401)
        .json({ message: "Cannot accept your own request" });
    }

    // Accept connection

    const acceptConnectionQuery = `UPDATE connections SET cstate = 'accepted' WHERE (user1id = $1 AND user2id = $2) OR (user1id = $2 AND user2id = $1)`;
    const acceptConnectionValues = [actionFrom, actionTo];
    await pool.query(acceptConnectionQuery, acceptConnectionValues);

    res.status(200).json({ message: "Connection accepted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const denyConnection = async (req, res) => {
  try {
    // Get users: actionFrom, actionTo
    const actionFrom = req.body.actionFrom;
    const actionTo = req.params.email;

    // Check if actionFrom and actionTo are the same
    if (actionFrom === actionTo) {
      return res.status(401).json({ message: "Cannot deny yourself" });
    }

    // Check if actionTo exists
    const emailQuery = "SELECT * FROM users WHERE email = $1";
    const emailValues = [actionTo];
    const { rows } = await pool.query(emailQuery, emailValues);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User does not exist" });
    }

    // Check if connection exists
    const cstate = await connectionStatus(req, res, actionFrom, actionTo);

    if (cstate[0] === false) {
      return res.status(401).json({ message: "Connection does not exist" });
    }

    // Check to see if the connection is accepted

    if (cstate[0] === "accepted") {
      return res
        .status(401)
        .json({ message: "Connection is already accepted" });
    }

    if (cstate[1] === actionFrom) {
      return res.status(401).json({ message: "Cannot deny your own request" });
    }

    // Deny connection

    const denyConnectionQuery = `DELETE FROM connections WHERE (user1id = $1 AND user2id = $2) OR (user1id = $2 AND user2id = $1)`;
    const denyConnectionValues = [actionFrom, actionTo];
    await pool.query(denyConnectionQuery, denyConnectionValues);

    res.status(200).json({ message: "Connection denied successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelConnection = async (req, res) => {
  // Cancel a connection request that you sent yourself
  try {
    // Get users: actionFrom, actionTo
    const actionFrom = req.body.actionFrom;
    const actionTo = req.params.email;

    // Check if actionFrom and actionTo are the same
    if (actionFrom === actionTo) {
      return res.status(401).json({ message: "Cannot deny yourself" });
    }

    // Check if connection request exists
    const cstate = await connectionStatus(req, res, actionFrom, actionTo);

    if (cstate[0] === false) {
      return res.status(401).json({ message: "Connection does not exist" });
    }

    // Check to see if the connection is accepted

    if (cstate[0] === "accepted") {
      return res
        .status(401)
        .json({ message: "Connection is already accepted" });
    }

    if (cstate[1] !== actionFrom) {
      return res
        .status(401)
        .json({ message: "Cannot cancel a connection you did not send" });
    }

    // Cancel connection

    const cancelConnectionQuery = `DELETE FROM connections WHERE (user1id = $1 AND user2id = $2) OR (user1id = $2 AND user2id = $1)`;
    const cancelConnectionValues = [actionFrom, actionTo];
    await pool.query(cancelConnectionQuery, cancelConnectionValues);

    res.status(200).json({ message: "Connection cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConnections = async (req, res) => {
  try {
    const email = req.params.email;
    const actionFrom = req.body.actionFrom;

    if (email !== actionFrom) {
      return res
        .status(401)
        .json({ message: "Cannot get connections for another user" });
    }

    const emailQuery = "SELECT * FROM users WHERE email = $1";
    const emailValues = [email];
    const result = await pool.query(emailQuery, emailValues);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const connectionQuery =
      "SELECT * FROM connections WHERE (user1id=$1 OR user2id=$1) AND cstate='accepted'";
    const connectionValues = [email];
    const { rows } = await pool.query(connectionQuery, connectionValues);

    res.status(200).json({ connections: rows });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

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

export const connectionStatus = async (req, res, actionFrom, actionTo) => {
  try {
    const connectionQuery =
      "SELECT * FROM connections WHERE (user1id=$1 AND user2id=$2) OR (user1id=$2 AND user2id=$1)";
    const connectionValues = [actionFrom, actionTo];
    const { rows } = await pool.query(connectionQuery, connectionValues);

    if (rows.length === 0) {
      return [false, false];
    } else {
      return [rows[0].cstate, rows[0].sentby];
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
