const { pool } = require("../config/db.js");
const { CustomError } = require("../utils/customError.js");

//
const getAllUser = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM users");
    if (response.rows.length === 0) {
      return res.status(404).json({
        error: "Can not fetch users",
      });
    }
    const users = response.rows;
    res.status(200).json({
      status: "ok",
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      error: "Error on fetching users!",
    });
  }
};

// get libraries that the user belong to.
const getLibDetails = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      "SELECT lib.library_id as library_id, lib.library_name AS library_name, u.full_name AS lib_owner_name, u.address AS lib_owner_address, u.email AS lib_owner_email FROM library_members libmem JOIN libraries lib ON libmem.library_id = lib.library_id JOIN users u ON lib.owner_id = u.user_id WHERE libmem.user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      throw new CustomError(
        "Siz hali hech qanday kutubxonaga az'o bolmagansiz",
        400
      );
    }

    res.status(200).json({
      libraries: result.rows,
      status: "ok",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// this brings all available books from libraries that the user is a member of.
const getAllBooksForUsers = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const books = await pool.query(
      `SELECT 
        b.book_id,
        b.read_count as read_count,
        b.title, 
        b.author, 
        b.publication_date, 
        b.status,
        c.category_name as category_name, 
        lib.library_name, 
        ow.user_id ,
        ow.full_name AS owner_name, 
        ow.address AS owner_address 
      FROM books b 
      JOIN library_members lm ON b.library_id = lm.library_id
      JOIN categories c ON b.category_id = c.category_id 
      JOIN libraries lib ON b.library_id = lib.library_id 
      JOIN users ow ON lib.owner_id = ow.user_id WHERE lm.user_id = $1 AND b.status = 'mavjud' ORDER BY b.title`,
      [userId]
    );

    if (books.rows.length === 0) {
      throw new CustomError(
        "Hozirda mavjud bo'lgan kitoblar topilmadi kutubxonalarda!",
        404
      );
    }
    // console.log("Books for users ", books.rows);

    res.status(200).json({
      status: "ok",
      books: books.rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// this shows the books that the user has borrowed and currenly has.
const getBorrowedBooks = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT r.rental_id, r.book_id, b.title, b.author, lib.library_name, r.rental_date, r.due_date, r.return_date, u.full_name as owner_name FROM rentals r JOIN books b ON b.book_id = r.book_id JOIN users u ON u.user_id = r.owner_id JOIN libraries lib ON b.library_id = lib.library_id  WHERE r.user_id = $1 AND r.status = 'jarayonda' `,
      [userId]
    );

    if (result.rows === 0) {
      throw new CustomError("Sizda ijaraga olingan kitoblar mavjud emas!", 404);
    }

    res.status(200).json({
      status: "ok",
      rentals: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUser,
  getLibDetails,
  getAllBooksForUsers,
  getBorrowedBooks,
};
