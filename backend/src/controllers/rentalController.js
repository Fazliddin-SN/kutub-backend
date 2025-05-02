const { pool } = require("../config/db.js");
const { CustomError } = require("../utils/customError.js");

const getAllRentals = async (req, res, next) => {
  const owner_id = req.user.id;
  try {
    // make sure library exists for this user
    const library = await pool.query(
      "SELECT * from libraries where owner_id = $1",
      [owner_id]
    );
    if (library.rows.length === 0) {
      throw new CustomError("Kutubxona topilmadi user uchun!");
    }

    const result = await pool.query(
      "SELECT * FROM rentals where owner_id = $1 ",
      [owner_id]
    );
    res.status(200).json({
      status: "ok",
      rentals: result.rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// get by id
const fetchRentalById = async (req, res, next) => {
  const { rental_id } = req.params;
  console.log("rental id ", rental_id);
  try {
    const result = await pool.query(
      "SELECT * FROM rentals WHERE rental_id = $1",
      [rental_id]
    );
    //check if rental exists
    if (result.rows.length === 0) {
      throw new CustomError("Bu id boyicha ijara topilmadi", 404);
    }
    res.status(200).json({
      rental: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
// create rental
const createRental = async (req, res, next) => {
  const owner_id = req.user.id;
  const { user_id, book_id, rental_date, due_date, return_date } = req.body;
  console.log(req.body);
  try {
    // parse into JS Dates
    const rentalDt = new Date(rental_date);
    const dueDt = new Date(due_date);
    const returnDt = new Date(return_date);

    // 1) rental_date must be on or before due_date and return_date
    if (rentalDt > dueDt || rentalDt > returnDt) {
      throw new CustomError(
        "Ijaraga berish sanasi ogohlantirish yoki qaytarish sanasidan keyin bo'lishi mumkin emas!",
        400
      );
    }

    // 2) due_date must be on or before return_date
    if (dueDt > returnDt) {
      throw new CustomError(
        "Ogohlantirish sanasi qaytarish sanasidan keyin bo'lishi mumkin emas!",
        400
      );
    }
    // find the library for the user
    const library = await pool.query(
      "SELECT * from libraries where owner_id = $1",
      [owner_id]
    );
    if (library.rows.length === 0) {
      throw new CustomError("Kutubxona topilmadi user uchun!");
    }
    // make sure user exists
    const user = await pool.query("SELECT * from users where user_id = $1", [
      user_id,
    ]);
    if (user.rows.length === 0) {
      throw new CustomError("foydalanuvchi topilmadi bu id bilan!");
    }
    // make sure book exists
    const book = await pool.query("SELECT * FROM books where book_id = $1", [
      book_id,
    ]);
    if (book.rows.length < 0) {
      throw new CustomError("Kitob topilmadi bu id bilan!");
    } // create rental
    const rental = await pool.query(
      "INSERT INTO rentals (user_id, book_id, rental_date, due_date, return_date, owner_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        user.rows[0].user_id,
        book_id,
        rental_date,
        due_date,
        return_date,
        owner_id,
      ]
    );
    if (rental.rows.length === 0) {
      throw new CustomError("Ijara yaratilmadi. ");
    }
    await pool.query(
      "UPDATE  books SET status = 'ijarada' where book_id = $1",
      [book_id]
    );
    res.status(201).json({
      message: "Ijara yaratildi",
      rental: rental.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
// update rental data. delaying return date due dat.
const updateRentalData = async (req, res, next) => {
  const owner_id = req.user.id;
  const { rentalId } = req.params;
  const { user_id, book_id, rental_date, due_date, return_date } = req.body;

  try {
    // parse into JS Dates
    const rentalDt = new Date(rental_date);
    const dueDt = new Date(due_date);
    const returnDt = new Date(return_date);

    // 1) rental_date must be on or before due_date and return_date
    if (rentalDt > dueDt || rentalDt > returnDt) {
      throw new CustomError(
        "Ijaraga berish sanasi ogohlantirish yoki qaytarish sanasidan keyin bo'lishi mumkin emas!",
        400
      );
    }

    // 2) due_date must be on or before return_date
    if (dueDt > returnDt) {
      throw new CustomError(
        "Ogohlantirish sanasi qaytarish sanasidan keyin bo'lishi mumkin emas!",
        400
      );
    }
    // find the library for the user
    const library = await pool.query(
      "SELECT * from libraries where owner_id = $1",
      [owner_id]
    );
    if (library.rows.length === 0) {
      throw new CustomError("Kutubxona topilmadi user uchun!", 404);
    }

    // check if rental exists with this id
    const rentalData = await pool.query(
      "SELECT * FROM rentals WHERE rental_id = $1",
      [rentalId]
    );
    if (rentalData.rows.length === 0) {
      throw new CustomError("Bu id bilan ijara malumotlari topilmadi", 404);
    }

    // updating the rental data
    const rental = await pool.query(
      "UPDATE rentals SET user_id = $1, book_id = $2, rental_date = $3, due_date = $4, return_date = $5 WHERE rental_id = $6 RETURNING *",
      [user_id, book_id, rental_date, due_date, return_date, rentalId]
    );
    if (rental.rows.length === 0) {
      throw new CustomError("Ijarani tahrirlashda xatolik ", 400);
    }

    //

    res.status(200).json({
      status: "ok",
      message: "Ijara malumotlari tahrirlandi!",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
// update rental return
const updateRentalReturn = async (req, res, next) => {
  const owner_id = req.user.id;
  const { rental_id, book_id } = req.query;
  console.log(req.query);

  try {
    if (!book_id || !rental_id) {
      throw new CustomError("Kitob id va rental id talab qilinadi");
    }
    // find the library for the user
    const library = await pool.query(
      "SELECT * from libraries where owner_id = $1",
      [owner_id]
    );
    if (library.rows.length === 0) {
      throw new CustomError("Kutubxona topilmadi foydalanuvchi uchun!", 404);
    }

    const result = await pool.query(
      "UPDATE rentals SET actual_return_date = CURRENT_DATE, status = $1 WHERE rental_id = $2 AND owner_id = $3 RETURNING *",
      ["qaytarildi", rental_id, owner_id]
    );
    // check if rental updated
    if (result.rows.length === 0) {
      throw new CustomError("Rental topilmadi!", 404);
    }

    await pool.query(
      "UPDATE books SET status = 'mavjud', read_count = read_count + 1 WHERE book_id = $1",
      [book_id]
    );

    res.status(200).json({
      message: "ijara o'zgartirildi!",
    });
  } catch (error) {
    console.log(error);

    next(error);
  }
};

// get user rentals by user id
const getUserRentals = async (req, res) => {
  //fetches renstal history for a specific user
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM rentals WHERE user_id = $1",
      [user_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error fetching user rentals!",
    });
  }
};

// fetching overdue rentals
const getOverdueRentals = async (req, res, next) => {
  const owner_id = req.user.id;
  try {
    // make sure library exists for this user
    const library = await pool.query(
      "SELECT * from libraries where owner_id = $1",
      [owner_id]
    );
    if (library.rows.length === 0) {
      throw new CustomError("Kutubxona topilmadi user uchun!");
    }

    const result = await pool.query(
      "SELECT r.rental_id, r.return_date, b.title, u.username FROM rentals r JOIN books b ON b.book_id = r.book_id JOIN users u ON u.user_id = r.user_id  where return_date < NOW() AND owner_id = $1 AND actual_return_date IS NULL ORDER BY r.return_date ASC",
      [owner_id]
    );

    if (result.rows.length === 0) {
      throw new CustomError("Sizda hali ijaralar tarixi mavjud emas", 400);
    }
    res.status(200).json({
      status: "ok",
      overdueRentals: result.rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//

// create rental request
const createRequest = async (req, res, next) => {
  const { user_email, message, book_id, owner_id } = req.body.requestData;
  console.log("body", req.body);
  try {
    const user = await pool.query("SELECT * from users WHERE email = $1", [
      user_email,
    ]);
    if (user.rows.length === 0) {
      throw new CustomError("Ro'yxatdan o'tgan emailingizni kiriting!", 400);
    }

    const requests = await pool.query(
      "INSERT INTO requests (user_email, owner_id, book_id, message) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_email, owner_id, book_id, message]
    );

    if (requests.rows.length === 0) {
      throw new CustomError("Ijara uchun so'rov jo'natilmadi!", 400);
    }

    res.status(201).json({
      status: "ok",
      message: "Ijara uchun so'rov jo'natildi!",
      request: requests.rows[0],
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// get request for the library owner that the users requested.
const getRequsts = async (req, res, next) => {
  const owner_id = req.user.id;
  try {
    const requests = await pool.query(
      "SELECT req.request_id, req.user_email, req.message, req.owner_id, b.title, req.created_at FROM requests req join books b on req.book_id = b.book_id WHERE owner_id = $1 ORDER BY created_at",
      [owner_id]
    );
    //
    if (requests.rows.length === 0) {
      throw new CustomError("Siz uchun so'rovlar topilmadi.", 404);
    }
    res.status(200).json({
      status: "ok",
      requests: requests.rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// approve the request
const approveRequest = async (req, res, next) => {
  const owner_id = req.user.id;
  const { user_email } = req.body;
  try {
    const request = await pool.query(
      "SELECT * FROM requests WHERE owner_id = $1 AND user_email = $2 ",
      [owner_id, user_email]
    );
    if (request.rows.length === 0) {
      throw new CustomError("Ijara so'rov topilmadi!", 404);
    }
    await pool.query(
      "DELETE FROM requests WHERE owner_id = $1 AND user_email = $2",
      [owner_id, user_email]
    );
    res.status(200).json({
      status: "ok",
      message: "Ijara tasdiqlandi!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRentals,
  fetchRentalById,
  createRental,
  updateRentalReturn,
  getUserRentals,
  createRequest,
  getRequsts,
  approveRequest,
  updateRentalData,
  getOverdueRentals,
};
