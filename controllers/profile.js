import { pool } from "../db.js";

export const getProfileFull = async (req, res) => {
  try {
    const actionFrom = req.body.actionFrom;
    const actionTo = req.body.actionTo;

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
    const actionTo = req.body.actionTo;
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
    // implementation here
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeConnection = async (req, res) => {
  try {
    // implementation here
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const acceptConnection = async (req, res) => {
  try {
    // implementation here
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const denyConnection = async (req, res) => {
  try {
    // implementation here
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelConnection = async (req, res) => {
  try {
    // implementation here
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

    const cstate = rows[0].cstate;

    res.status(200).json({ cstate: cstate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
