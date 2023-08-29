import { pool } from "../db.js";
import { connectionStatus } from "./cstate.js";

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

    const isMyProfile = actionFrom === actionTo;

    let cstate = false;
    let sentby = false;

    if (isMyProfile === false) {
      const result = await connectionStatus(req, res, actionFrom, actionTo);
      cstate = result[0];
      sentby = result[1];
    }

    const values = {
      username: user.username,
      firstName: user.firstname,
      lastName: user.lastname,
      company: user.company,
      studentProgram: user.studentprogram,
      studentLocation: user.studentlocation,
      educationalInstitution: user.educationalinstitution,
      schoolProgram: user.schoolprogram,
      meInOneSentence: user.meinonesentence,
      github: user.github,
      linkedin: user.linkedin,
      facebook: user.facebook,
      meInFourTags1: user.mein4tags1,
      meInFourTags2: user.mein4tags2,
      meInFourTags3: user.mein4tags3,
      meInFourTags4: user.mein4tags4,
      internPosition: user.internposition,
      internTeam: user.internteam,
      currentTerm: user.currentterm,
      pastTerms: user.pastterms,
      isMyProfile: isMyProfile,
      cstate: cstate,
      sentby: sentby,
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
        return `${key}=$${index + 2}`; // Use numbered placeholders
      })
      .join(",");

    const updateQuery = `UPDATE users SET ${setClause} WHERE email=$1`;

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

    if (cstate[0] !== "not connected") {
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
