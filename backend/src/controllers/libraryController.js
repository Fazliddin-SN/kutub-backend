const bcrypt = require("bcrypt");
const { pool } = require("../config/db");
const { CustomError } = require("../utils/customError");

const libraryController = {
  async create(req, res, next) {
    const { library_name, user_email } = req.body;
    // console.log("body", req.body);
    try {
      const user = await pool.query("SELECT * FROM users where email = $1", [
        user_email,
      ]);
      if (user.rows.length === 0) {
        throw new CustomError("Bu email bilan foydalanuvchi topilmadi!", 404);
      }

      if (!library_name || !user_email) {
        throw new CustomError(
          "Kutubxona nomi  va email kiritilishi shart!",
          400
        );
      }
      const result = await pool.query(
        "INSERT INTO libraries (owner_id , library_name, created_at)  VALUES ($1, $2, NOW()) RETURNING *",
        [user.rows[0].user_id, library_name]
      );

      if (result.rows.length === 0) {
        throw new CustomError(
          "Kutubxona yaratilmadi. Qaytadan urining iltimos",
          400
        );
      }
      res.status(201).json({
        status: "ok",
        library: result.rows[0],
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  // get library by owner id
  async getLib(req, res, next) {
    const owner_id = req.user.id;
    try {
      const result = await pool.query(
        "SELECT * FROM libraries WHERE owner_id = $1",
        [owner_id]
      );
      if (result.rows.length === 0) {
        throw new CustomError(
          "Bu foydalanuvchining kutubxonasi topilmadi",
          404
        );
      }
      res.status(200).json({
        status: "ok",
        library: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },
  // update library
  async updateLib(req, res, next) {
    const library_name = req.body.library_name;
    const owner_id = req.user.id;
    try {
      const library = await pool.query(
        "SELECT * FROM libraries WHERE owner_id = $1",
        [owner_id]
      );
      if (!library) {
        throw new CustomError("Library not found!", 404);
      }
      const updatedLib = await pool.query(
        "UPDATE libraries SET library_name = $1 WHERE owner_id = $2 RETURNING *",
        [library_name, owner_id]
      );

      res.status(200).json({
        status: "ok",
        message: "Updated!",
        library: updatedLib.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },
  // delete library
  async deleteLib(req, res, next) {
    const { library_id } = req.params;
    try {
      // const library = await pool.query(
      //   "SELECT * FROM libraries WHERE owner_id = $1",
      //   [owner_id]
      // );
      // if (!library) {
      //   throw new CustomError("Library not found!");
      // }
      await pool.query("DELETE FROM libraries WHERE library_id = $1", [
        library_id,
      ]);
      res.status(200).json({
        status: "ok",
        message: "Deleted!",
      });
    } catch (error) {
      next(error);
    }
  },
  // Add members
  async addMember(req, res, next) {
    const owner_id = req.user.id;
    const { full_name, user_name, email, password, address, phone_number } =
      req.body;
    // console.log("req body ", req.body);

    try {
      const regex = /^[\w.-]+@gmail\.com$/i;
      if (!regex.test(email)) {
        throw new CustomError("Email yarqosiz", 400);
      }
      // Check if user already exists
      const userExists = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (userExists.rows.length > 0) {
        throw new CustomError("User already exists with this email", 400);
      }
      // Hash the password
      const saltRounds = 10;

      const hashedPassword = await bcrypt.hash(password, saltRounds);
      //  Insert new user record
      const newUser = await pool.query(
        "INSERT INTO users (full_name, username, email, password, address, phonenumber ) values ($1, $2, $3, $4, $5, $6) RETURNING *",
        [full_name, user_name, email, hashedPassword, address, phone_number]
      );
      // find lib by owner id
      const library = await pool.query(
        "SELECT * FROM libraries WHERE owner_id = $1",
        [owner_id]
      );
      if (!library) {
        throw new CustomError("Library not found!", 404);
      }
      const newMember = await pool.query(
        "INSERT INTO library_members (library_id, user_id) VALUES ($1, $2) RETURNING * ",
        [library.rows[0].library_id, newUser.rows[0].user_id]
      );

      res.status(201).json({ status: "ok", newMember: newUser.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: error.message,
      });
    }
  },

  // getMembers
  async getLibraryMembers(req, res, next) {
    const owner_id = req.user.id;
    try {
      const library = await pool.query(
        "SELECT * FROM libraries WHERE owner_id = $1",
        [owner_id]
      );
      if (!library) {
        throw new CustomError("Kutubxona topilmadi!", 404);
      }
      const result = await pool.query(
        "select u.user_id, u.full_name, u.username, u.email, u.address, u.phonenumber from users u join library_members lm on lm.user_id = u.user_id where lm.library_id = $1",
        [library.rows[0].library_id]
      );

      if (!result.rows || result.rows.length === 0) {
        throw new CustomError("Bu kutubxona uchun azolar topilmadi");
      }
      res.status(200).json({
        status: "ok",
        members: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },
  // get member by id
  async getMemberById(req, res, next) {
    const { member_id } = req.params;
    const owner_id = req.user.id;
    try {
      const library = await pool.query(
        "SELECT * FROM libraries WHERE owner_id = $1",
        [owner_id]
      );
      if (!library) {
        throw new CustomError("Kutubxona topilmadi!", 404);
      }
      //
      const user = await pool.query(
        "SELECT u.user_id, u.username, u.full_name, u.email, u.address, u.phonenumber FROM users u JOIN library_members lm on u.user_id = lm.user_id WHERE u.user_id = $1 AND lm.library_id = $2",
        [member_id, library.rows[0].library_id]
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
  },
  // remove member
  async removeMember(req, res, next) {
    const { member_id } = req.params;
    const owner_id = req.user.id;
    try {
      const library = await pool.query(
        "SELECT * FROM libraries WHERE owner_id = $1",
        [owner_id]
      );
      if (!library) {
        throw new CustomError("Library not found!");
      }
      await pool.query(
        "DELETE FROM library_members WHERE library_id = $1 AND user_id = $2",
        [library.rows[0].library_id, member_id]
      );
      await pool.query("DELETE FROM users WHERE user_id = $1", [member_id]);
      res.status(200).json({
        message: "User removed",
        status: "ok",
      });
    } catch (error) {
      next(error);
    }
  },
  async updateMember(req, res, next) {
    const owner_id = req.user.id;
    const { member_id } = req.params;
    const { full_name, username, email, password, address, phonenumber } =
      req.body;
    console.log("pass", req.body);

    try {
      const library = await pool.query(
        "SELECT * FROM libraries WHERE owner_id = $1",
        [owner_id]
      );
      if (!library) {
        throw new CustomError(
          "Kutubxona topilmadi bu foydalanuvchi uchun",
          404
        );
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const response = await pool.query(
        "UPDATE users SET full_name = $1, username = $2, email = $3, password = $4, address = $5, phonenumber = $6 WHERE user_id = (SELECT user_id FROM library_members WHERE user_id = $7 AND library_id = $8) RETURNING * ",
        [
          full_name,
          username,
          email,
          hashedPassword,
          address,
          phonenumber,
          member_id,
          library.rows[0].library_id,
        ]
      );
      if (response.rows.length === 0) {
        throw new CustomError("Foydalanuvchi bu kutubxona azosi emas!", 403);
      }
      res.status(200).json({
        status: "ok",
        message: "Member is updated!",
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};

module.exports = libraryController;
