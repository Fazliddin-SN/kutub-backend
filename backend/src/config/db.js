const { Pool } = require("pg");
require("dotenv").config();
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Connect to posthreSQL successfully!");
    client.release();
  } catch (error) {
    console.error("Connection error: ", error);
  }
};

module.exports = { connectDB, pool };
