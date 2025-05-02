const { pool } = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { CustomError } = require("../utils/customError.js");

const register = async (req, res, next) => {
  const { full_name, username, email, password, address, phonenumber } =
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
      "INSERT INTO users (full_name, username, email, password, address, phonenumber) values ($1, $2, $3, $4, $5, $6) RETURNING *",
      [full_name, username, email, hashedPassword, address, phonenumber]
    );
    res.status(201).json({ status: "ok", newUser: newUser.rows[0] });
  } catch (error) {
    // console.error(error);
    next(error);
  }
};
// Login page

const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log("body", req.body);

  try {
    // check if user exists
    const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userQuery.rows.length === 0) {
      throw new CustomError("Parol yoki Email xato", 400);
    }

    const user = userQuery.rows[0];
    //Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError("Parol yoki Email xato", 400);
    }

    // Create a JWT token (expires in 1 hour)
    const token = jwt.sign(
      {
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    // console.log(userQuery.rows[0]);

    res.status(200).json({ status: "ok", token, user: userQuery.rows[0] });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const authMe = async (req, res, next) => {
  const user_id = req.user.id;
  try {
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);
    if (user.rows.length === 0) {
      throw new CustomError("Foydalanuvchi topilmadi.", 404);
    }
    res.status(200).json({
      user: user.rows[0],
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { register, login, authMe };
