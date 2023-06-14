// Import modules
import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// Create express app
const app = express();
const port = 5000;

// Convert the file URL to file path
const __filename = fileURLToPath(import.meta.url);
// Gets the directory name of a file path
const __dirname = path.dirname(__filename);

// Create middleware
// Helmet is a middleware that helps secure Express applications by setting various HTTP headers related to security, such as Content Security Policy, XSS Protection, and more
app.use(helmet());

// This specific helmet middleware sets the Cross-Origin Resource Policy (CORP) header to "cross-origin", which allows cross-origin requests for the specified resources
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Morgan is a popular logging middleware that logs HTTP request details to the console. In this case, it is configured to use the "common" log format
app.use(morgan("common"));

// This middleware parses incoming requests with JSON payloads, similar to express.json(). It allows you to specify a limit on the payload size and enables parsing of nested objects
app.use(bodyParser.json({ limit: "30mb", extended: true }));

// This middleware parses URL-encoded form data from incoming requests. It also allows you to specify a limit on the payload size and enables parsing of nested objects
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// This middleware serves static files from the specified directory (public/assets). It allows you to serve assets like images, CSS files, or client-side JavaScript files
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// Cors = Cross Origin Resource Sharing (allows us to make requests from the frontend to the backend)
// Basically, it is a security feature that prevents other people from making requests to our backend (unless we allow them to)
app.use(cors());

// express.json() allows us to parse JSON
// Specifically, this middleware parses the request body if it contains JSON data and populates the req.body property with the parsed JSON object.
app.use(express.json());

// Create routes
app.use("/auth", authRoutes);

app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Start the server
app.listen(port, () => {
  console.log("Server has started");
});
