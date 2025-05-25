const { pool } = require("../config/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const { bucketName, storage, deleteFromGCS } = require("../middlewares/gcs.js");
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
  const { username, password } = req.body;

  try {
    // check if user exists
    const userQuery = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
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

// getting user details for all types of users
// get member by id
async function authMe(req, res, next) {
  const userId = req.user.id;
  try {
    //
    const user = await pool.query(
      "SELECT u.user_id, u.username, u.full_name, u.email, u.address, u.phonenumber FROM users u WHERE user_id = $1",
      [userId]
    );

    if (user.rows.length === 0) {
      throw new CustomError("Bu id bilan foydalanuvchi topilmadi!", 404);
    }
    res.status(200).json({
      status: "ok",
      user: user.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  const userId = req.user.id;
  const { full_name, address, phonenumber, avatar } = req.body;
  console.log("req body ", req.body);

  try {
    if (
      (!full_name || full_name.length < 4 || !address || address.length < 4,
      !phonenumber || !phonenumber.startsWith("+998"))
    ) {
      return res.status(400).json({
        error:
          "Ism-familiya va Manzil kamida 4 harfdan iborat bo'lishi kerak, Tel raqam '+998' shunday boshlanishi kerak",
      });
    }
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      userId,
    ]);

    // getting old image details to prevent dublicates
    const oldImageURl = user.rows[0].avatar;

    if (user.rows.length === 0) {
      return res.status(404).json({
        error: "Bu ID bilan Foydalanuvchi topilmadi",
      });
    }
    let coverUrl = avatar;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const objectPath = `users/${userId}/${Date.now()}${ext}`;
      const file = storage.bucket(bucketName).file(objectPath);

      // upload buffer directly
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
        resumable: false,
        public: true,
      });

      await file.makePublic();
      coverUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;
    }

    const result = await pool.query(
      "UPDATE users SET full_name = $1, address = $2, phonenumber = $3, avatar = $4 WHERE user_id = $5 RETURNING *",
      [full_name, address, phonenumber, coverUrl, userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Foydalanuvchi Malumotlari tahrirlanmadi",
      });
    }

    //Now that everything succeeded, delete the old file (if we uploaded a new one)
    if (req.file && oldImageURl && oldImageURl.includes(bucketName)) {
      const oldFilename = oldImageURl.split("/").pop();
      await deleteFromGCS(oldFilename);
    }
    res.status(200).json({
      status: "ok",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = { register, login, authMe, updateUser };
