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

    if (isMyProfile) {
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

    let qstring = "";
    const setClause = Object.keys(fieldsToUpdate).map((key, index) => {
      qstring += `${key}=${fieldsToUpdate[key]}`;
      if (index !== Object.keys(fieldsToUpdate).length - 1) {
        string += ",";
      }
    });

    const updateQuery = `UPDATE users SET ${qstring} WHERE email = $1`;
    const toUpdateValues = [actionTo];
    await pool.query(updateQuery, toUpdateValues);

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
    const connectionStatus = await connectionStatus(
      req,
      res,
      actionFrom,
      actionTo
    );

    if (connectionStatus.cstate !== false) {
      return res.status(401).json({ message: "Connection already exists" });
    }

    // Create connection
    const createConnectionQuery = `INSERT INTO connections (user1, user2, cstate) VALUES ($1, $2, $3)`;
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
    const connectionStatus = await connectionStatus(
      req,
      res,
      actionFrom,
      actionTo
    );

    if (connectionStatus.cstate === false) {
      return res.status(401).json({ message: "Connection does not exist" });
    }

    // Check to see if connection is pending

    if (connectionStatus.cstate === "pending") {
      return res
        .status(401)
        .json({ message: "Connection is pending, cannot remove" });
    }

    // Remove connection
    const removeConnectionQuery = `DELETE FROM connections WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)`;
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
    const connectionStatus = await connectionStatus(
      req,
      res,
      actionFrom,
      actionTo
    );

    if (connectionStatus.cstate === false) {
      return res.status(401).json({ message: "Connection does not exist" });
    }

    // Check to see if connection is already accepted

    if (connectionStatus.cstate === "accepted") {
      return res
        .status(401)
        .json({ message: "Connection is already accepted" });
    }

    // Accept connection

    const acceptConnectionQuery = `UPDATE connections SET cstate = 'accepted' WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)`;
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
    const connectionStatus = await connectionStatus(
      req,
      res,
      actionFrom,
      actionTo
    );

    if (connectionStatus.cstate === false) {
      return res.status(401).json({ message: "Connection does not exist" });
    }

    // Check to see if the connection is accepted

    if (connectionStatus.cstate === "accepted") {
      return res
        .status(401)
        .json({ message: "Connection is already accepted" });
    }

    // Deny connection

    const denyConnectionQuery = `DELETE FROM connections WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)`;
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
    const connectionStatus = await connectionStatus(
      req,
      res,
      actionFrom,
      actionTo
    );

    if (connectionStatus.cstate === false) {
      return res.status(401).json({ message: "Connection does not exist" });
    }

    // Check to see if the connection is accepted

    if (connectionStatus.cstate === "accepted") {
      return res
        .status(401)
        .json({ message: "Connection is already accepted" });
    }

    // Cancel connection

    const cancelConnectionQuery = `DELETE FROM connections WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)`;
    const cancelConnectionValues = [actionFrom, actionTo];
    await pool.query(cancelConnectionQuery, cancelConnectionValues);

    res.status(200).json({ message: "Connection cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const connectionStatus = async (req, res, actionFrom, actionTo) => {
  try {
    const connectionQuery =
      "SELECT cstate FROM connections WHERE (user1=$1 AND user2=$2) OR (user1=$2 AND user2=$1)";
    const connectionValues = [actionFrom, actionTo];
    const { rows } = await pool.query(connectionQuery, connectionValues);

    if (rows.length === 0) {
      return res.status(401).json({ cstate: false });
    } else {
      res.status(200).json({ cstate: rows[0].cstate });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
