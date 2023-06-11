// Import the pool class
import pkg from "pg";
const { Pool } = pkg;

// Import the dotenv module and configure it
import dotenv from "dotenv";

dotenv.config();

// Create a new pool instance
export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: "localhost",
  port: 5432,
  database: "velospheredb",
});

// If you wanted to create another pool, you can do so below
