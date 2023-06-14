import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import nodemailer from "nodemailer";
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
      currentTerm,
      pastTerms,
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

    // If the current term variable isn't in the format of "s23 or f23 or w23" etc. then return an error
    if (!currentTerm.match(/^[sfw]\d{2}$/i)) {
      return res.status(401).json({ message: "Invalid current term" });
    }

    // Past terms can either be null or in the format of a list of terms separated by commas (terms in the same format as above)
    if (pastTerms !== null) {
      const pastTermsList = pastTerms.split(",");
      for (let i = 0; i < pastTermsList.length; i++) {
        if (!pastTermsList[i].match(/^[sfw]\d{2}$/i)) {
          return res.status(401).json({ message: "Invalid past terms" });
        }
      }
    }

    // Connections is meant to be an empty list of id's
    const connections = [];

    const registrationQuery =
      "INSERT INTO users (username, password, firstname, lastname, email, studentprogram, company, internposition, educationalinstitution, schoolprogram, profilepicture, meinonesentence, studentlocation, twitter, linkedin, facebook, github, internteam, mein4tags1, mein4tags2, mein4tags3, mein4tags4, currentterm, pastterms, connections) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)";

    const registrationValues = [
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
      currentTerm,
      pastTerms,
      connections,
    ];

    await pool.query(registrationQuery, registrationValues);

    const payload = {
      p_email: email,
    };

    // Payload prints fine here
    await sendConfirmationEmail(req, res, payload);

    res.status(201).json({
      message:
        "User succesfully registered. Please confirm your account by clicking the link in the email just sent. Thank you!",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    // Retrieve username and password from the request body
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    let { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const quser = rows[0];

    const isValidPassword = password === quser.password;

    // If the password is invalid, send a 400 status code and a message saying that the password is invalid
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // If the user has not confirmed their email, send a 400 status code and a message saying that the user has not confirmed their email
    if (!quser.confirmed) {
      return res.status(400).json({
        message:
          "Please confirm your email via the link sent to you to login. Thank you!",
      });
    }

    var user = {
      email: quser.email,
      confirmed: quser.confirmed,
      id: quser.id,
      username: quser.username,
      firstName: quser.firstname,
      lastName: quser.lastname,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resendConfirmationEmail = async (req, res) => {
  try {
    // Retrieve the necessary data from the request, such as email and token
    const { email } = req.body;

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

    const payload = {
      p_email: email,
    };

    // Call the function responsible for sending the confirmation email
    await sendConfirmationEmail(req, res, payload);

    // Send the response back to the client
    res.status(200).json({ message: "Confirmation email resent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendConfirmationEmail = async (req, res, payload) => {
  try {
    let email = payload.p_email;
    const token = jwt.sign(email, process.env.JWT_SECRET);

    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASS,
      },
    });

    let url = `http://localhost:5000/auth/confirm-email/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_NAME,
      to: process.env.RECEIVING_EMAIL,
      subject: "Confirm your email",
      html: `<h1>Email Confirmation</h1>
    <h2>Hello ${email}</h2>
    <p>Thank you for registering. Please confirm your email by clicking on the following link:</p>
    <a href="${url}">${url}</a>`,
    };

    await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json({ message: "Email sent" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const confirmEmail = async (req, res) => {
  try {
    const token = req.params.token;
    const email = jwt.verify(token, process.env.JWT_SECRET);

    const query = "UPDATE users SET confirmed = true WHERE email = $1";
    const values = [email];
    await pool.query(query, values);
    res.status(200).json({ message: "Succesfully confirmed email account" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = req.params.email;

    const query = "SELECT password FROM users WHERE email = $1";
    const values = [email];
    let { rows } = await pool.query(query, values);
    const password = rows[0].password;

    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_NAME,
      to: process.env.RECEIVING_EMAIL, // replace this with email
      subject: "Forgotten Password",
      html: `<h1>Whoops! It seems like you have forgotten your password...</h1>
      <p>It seems like you have forgotten your password. Below is your password.</p>
      <h2> Your password is: ${password}</h2>
      </div>`,
    };

    await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json({ message: "Email sent" });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
