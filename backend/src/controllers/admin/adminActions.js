const { pool } = require("../../config/db.js");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { CustomError } = require("../../utils/customError.js");

const signUp = async (req, res, next) => {
  const { full_name, username, email, password, address, phone_number, role } =
    req.body;
  // console.log("req body", req.body);

  try {
    // Check if user already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      throw new CustomError(
        "Bu email bilan alloqachon ro'yxatdan o'tilgan",
        400
      );
    }
    // Hash the password
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    //  Insert new user record
    const newUser = await pool.query(
      "INSERT INTO users (full_name, username, email, password, address, phonenumber, role) values ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [full_name, username, email, hashedPassword, address, phone_number, role]
    );
    res.status(201).json({ status: "ok", newUser: newUser.rows[0] });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { signUp };
