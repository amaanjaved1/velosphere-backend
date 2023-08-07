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
      meInOneSentence,
      studentLocation,
      linkedIn,
      facebook,
      github,
      meIn4Tags1,
      meIn4Tags2,
      meIn4Tags3,
      meIn4Tags4,
      internTeam,
      currentTerm,
      commEmail,
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

    // Encrypt the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const pastterms = "";

    const registrationQuery =
      "INSERT INTO users (username, password, firstname, lastname, email, studentprogram, company, internposition, educationalinstitution, schoolprogram, meinonesentence, studentlocation, linkedin, facebook, github, internteam, mein4tags1, mein4tags2, mein4tags3, mein4tags4, currentterm, pastterms, commEmail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)";

    const registrationValues = [
      username,
      hashedPassword,
      firstName,
      lastName,
      email,
      studentProgram,
      company,
      internPosition,
      educationalInstitution,
      schoolProgram,
      meInOneSentence,
      studentLocation,
      linkedIn,
      facebook,
      github,
      internTeam,
      meIn4Tags1,
      meIn4Tags2,
      meIn4Tags3,
      meIn4Tags4,
      currentTerm,
      pastterms,
      commEmail,
    ];

    await pool.query(registrationQuery, registrationValues);

    const payload = {
      email: email,
      commEmail: commEmail,
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

    // Compared the password entered with the password in the database (the database password is hashed)

    const isValidPassword = await bcrypt.compare(password, quser.password);

    // If the password is invalid, send a 400 status code and a message saying that the password is invalid
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // If the user has not confirmed their email, send a 400 status code and a message saying that the user has not confirmed their email
    if (!quser.confirmed) {
      return res.status(400).json({
        message:
          "Please confirm your email via the link sent to you to login. If you haven't received one yet, please use the option below",
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

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "14d" });

    const today = new Date(); // Get today's date

    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 7); // Add 7 days to today's date

    // Send the information back to the frontend
    res.status(200).json({ token: token, expirationDate: expirationDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resendConfirmationEmail = async (req, res) => {
  try {
    // Retrieve the necessary data from the request, such as email and token
    const { email, commEmail } = req.body;

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
      email: email,
      commEmail: commEmail,
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
    let email = payload.email;
    let commEmail = payload.commEmail;

    const token = jwt.sign(email, process.env.JWT_SECRET);

    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASS,
      },
    });

    let url = `${process.env.BACKEND_SERVER_NAME}/auth/confirm-email/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_NAME,
      to: commEmail,
      subject: "Confirm your email",
      html: `<h1>Email Confirmation</h1>
    <h2>Hello ${email}</h2>
    <p>Thank you for registering. Please confirm your email by clicking the link below. Once you do so, your login will work:</p>
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

    const query = "UPDATE users SET confirmed=true WHERE email = $1";
    const values = [email];
    await pool.query(query, values);
    res.status(200).json({
      message:
        "Succesfully confirmed email account. Please navigate to https://velosphere.onrender.com/",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check to see if the user exists
    const query = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    let { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = rows[0];

    const commEmail = user.commemail;

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Encrypt the password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a token that has a payload which contains the user's email and their password

    const token = jwt.sign(
      { email: email, password: hashedPassword },
      process.env.JWT_SECRET
    );

    let url = `${process.env.BACKEND_SERVER_NAME}/auth/confirm-password-change/${token}`;

    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_NAME,
      to: commEmail,
      subject: "Forgotten Password",
      html: `<h1>Whoops! It seems like you have forgotten your password...</h1>
      <p>Please click the link below to apply the password change you requested.</p>
      <p>Not you? Please ignore this email.</p>
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

export const confirmPasswordChange = async (req, res) => {
  try {
    const token = req.params.token;

    // Get the email and the password from the payload
    const { email, password } = jwt.verify(token, process.env.JWT_SECRET);

    const query = "UPDATE users SET password=$2 WHERE email=$1";
    const values = [email, password];
    await pool.query(query, values);
    res.status(200).json({ message: "Succesfully changed password" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
