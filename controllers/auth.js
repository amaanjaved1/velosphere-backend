import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  try {
    let {
      username,
      password,
      firstName,
      lastName,
      email,
      studentProgram,
      company,
      internPosition,
      educationalInstitution,
      schoolProgram,
      profilePicture,
      meInOneSentence,
      studentLocation,
      twitter,
      linkedIn,
      facebook,
      github,
      meIn4Tags1,
      meIn4Tags2,
      meIn4Tags3,
      meIn4Tags4,
      internTeam,
    } = req.body;

    // Check to see if the user is already registered

    const emailQuery = "SELECT * FROM users WHERE email = $1";
    const emailValues = [email];
    const { rows } = await pool.query(emailQuery, emailValues);

    // If the user is already registered, send a 401 status code and a message saying that the user already exists
    if (rows.length > 0) {
      return res.status(401).json({ message: "User already exists" });
    }

    // Check to see if the email is a valid email (if it contains tangerine, scotiabank, md finacial)
    const emailCompany = email.split("@")[1].split(".")[0];
    let match;

    if (
      emailCompany === "tangerine" ||
      emailCompany === "scotiabank" ||
      emailCompany === "mdfinancial"
    ) {
      match = true;
    } else {
      match = false;
    }

    if (!match) {
      return res.status(401).json({ message: "Invalid email" });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const registrationQuery =
      "INSERT INTO users (username, password, firstname, lastname, email, studentprogram, company, internposition, educationalinstitution, schoolprogram, profilepicture, meinonesentence, studentlocation, twitter, linkedin, facebook, github, internteam, mein4tags1, mein4tags2, mein4tags3, mein4tags4, confirmed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)";

    const registrationValues = [
      username,
      passwordHash,
      firstName,
      lastName,
      email,
      studentProgram,
      company,
      internPosition,
      educationalInstitution,
      schoolProgram,
      profilePicture,
      meInOneSentence,
      studentLocation,
      twitter,
      linkedIn,
      facebook,
      github,
      meIn4Tags1,
      meIn4Tags2,
      meIn4Tags3,
      meIn4Tags4,
      internTeam,
      true,
    ];

    await pool.query(registrationQuery, registrationValues);

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    // Retrieve username and password from the request body
    const { email, password } = req.body;

    const query =
      "SELECT password, confirmed, email, firstname, lastname, id, username FROM users WHERE email = $1";
    const values = [email];
    let { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const quser = rows[0];

    const isValidPassword = await bcrypt.compare(password, quser.password);

    // If the password is invalid, send a 400 status code and a message saying that the password is invalid
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // If the user has not confirmed their email, send a 400 status code and a message saying that the user has not confirmed their email
    if (!quser.confirmed) {
      return res.status(400).json({ message: "Please confirm email" });
    }

    var user = {
      email: quser.email,
      confirmed: quser.confirmed,
      id: quser.id,
      username: quser.username,
      firstname: quser.firstname,
      lastname: quser.lastname,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET);

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendConfirmationEmail = async (req, res) => {
  try {
    // implementation here
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const confirmEmail = async (req, res) => {
  try {
    // implementation here
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    // implementation here
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
