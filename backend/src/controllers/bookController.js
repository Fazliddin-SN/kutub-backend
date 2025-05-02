const { pool } = require("../config/db.js");
const { CustomError } = require("../utils/customError.js");
const { bucketName, storage, deleteFromGCS } = require("../middlewares/gcs.js");
const path = require("path");
///
const getAllBooks = async (req, res, next) => {
  const user_id = req.user.id;
  const role = req.user.role;
  const library_id = req.query.library_id; // Get library_id from request query
  //
  try {
    if (!library_id) {
      throw new CustomError("Kutubxona ID si talab qilinadi", 400);
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // 🔹 If user is a member, verify membership & fetch books
    if (role === "user") {
      const isMember = await pool.query(
        "SELECT * FROM library_members WHERE user_id = $1 AND library_id = $2",
        [user_id, library_id]
      );

      if (isMember.rows.length === 0) {
        throw new CustomError("Siz bu kutubxona azosi emassiz!", 403);
      }

      // Fetch books for the library the user is a member of
      const result = await pool.query(
        "SELECT * FROM books WHERE library_id = $1 ORDER BY book_id LIMIT $2 OFFSET $3",
        [library_id, pageSize, offset]
      );

      // Get total books count for pagination
      const countQuery = await pool.query(
        "SELECT COUNT(*) FROM books WHERE library_id = $1",
        [library_id]
      );
      const total = parseInt(countQuery.rows[0].count);

      return res.status(200).json({
        status: "ok",
        total,
        page,
        pageSize,
        books: result.rows,
      });
    }

    // 🔹 If user is an owner, fetch books for their library
    if (role === "owner") {
      const ownerLibrary = await pool.query(
        "SELECT library_id FROM libraries WHERE owner_id = $1",
        [user_id]
      );

      if (ownerLibrary.rows.length === 0) {
        throw new CustomError(
          "Bu kutubxona egasi uchun hech qanday kutubxona topilmadi",
          404
        );
      }

      const owner_library_id = ownerLibrary.rows[0].library_id; // Get owner's library_id

      const result = await pool.query(
        "SELECT * FROM books WHERE library_id = $1 ORDER BY book_id LIMIT $2 OFFSET $3",
        [owner_library_id, pageSize, offset]
      );

      // Get total books count for pagination
      const countQuery = await pool.query(
        "SELECT COUNT(*) FROM books WHERE library_id = $1",
        [owner_library_id]
      );
      const total = parseInt(countQuery.rows[0].count);

      return res.status(200).json({
        status: "ok",
        total,
        page,
        pageSize,
        books: result.rows,
      });
    }
    throw new CustomError("Unauthorized access!", 403);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
//  get books for the requester's library
const getBooksBylibray = async (req, res, next) => {
  const owner_id = req.user.id;
  // console.log(owner_id);
  try {
    const library = await pool.query(
      "SELECT * FROM libraries WHERE owner_id = $1",
      [owner_id]
    );
    if (!library) {
      throw new CustomError("Hech qanday kutubxona topilmadi", 404);
    }
    console.log("library_id ", library.rows[0].library_id);

    const books = await pool.query(
      "SELECT * FROM books WHERE library_id = $1",
      [library.rows[0].library_id]
    );
    if (!books || books.rows.length === 0) {
      throw new CustomError("Bu kutubxonada kitoblar topilmadi!", 404);
    }

    // Filter books and update status if the return_date < current_date
    const now = Date.now();

    for (let b of books.rows) {
      if (new Date(b.return_date).getTime() < now) {
        await pool.query(
          `UPDATE books SET status = 'kechikkan' WHERE book_id = $1`,
          [b.book_id]
        );
      }
    }
    res.status(200).json({
      status: "ok",
      books: books.rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
// get book by its id from owner's libraryz
const getBookById = async (req, res, next) => {
  const owner_id = req.user.id;
  const { book_id } = req.params;
  try {
    const library = await pool.query(
      "SELECT * FROM libraries WHERE owner_id = $1",
      [owner_id]
    );
    if (!library) {
      throw new CustomError("Hech qanday kutubxona topilmadi", 404);
    }
    const book = await pool.query(
      "SELECT * FROM books where book_id = $1 AND library_id = $2",
      [book_id, library.rows[0].library_id]
    );
    if (book.rows.length === 0) {
      throw new CustomError("Hech qanday kitob topilmadi bu id bilan", 404);
    }

    res.status(200).json({
      status: "ok",
      book: book.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
// CREATE BOOK
const addBook = async (req, res, next) => {
  const owner_id = req.user.id;
  const { title, author, isbn, category, publication_date, status } = req.body;

  // console.log("req.body", req.body);
  // console.log("req file ", req.file);

  try {
    // start trasnaction
    await pool.query("BEGIN");
    // define category_id
    const categoryDetail = await pool.query(
      "SELECT * FROM categories WHERE category_name = $1",
      [category]
    );
    if (categoryDetail.rows.length === 0) {
      throw new CustomError("Bu type dagi kategoriya topilmadi!", 404);
    }
    // find library by owner id
    const library = await pool.query(
      "SELECT * FROM libraries WHERE owner_id = $1",
      [owner_id]
    );
    // console.log("library: ", library.rows);

    if (library.rows.length === 0) {
      throw new CustomError(
        "Hech qanday kutubxona topilmadi bu user uchun",
        404
      );
    }

    //insert the book row, returning the new id
    const result = await pool.query(
      `INSERT INTO books (title, author, isbn, category_id, publication_date, status, library_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        title,
        author,
        isbn,
        categoryDetail.rows[0].category_id,
        publication_date,
        status || "mavjud",
        library.rows[0].library_id,
      ]
    );
    const book = result.rows[0];
    const bookId = book.book_id;
    // 3) if an image was uploaded, stream it to GCS using that ID
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const objectPath = `books/${bookId}/${Date.now()}${ext}`;
      const file = storage.bucket(bucketName).file(objectPath);

      // upload buffer directly
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
        resumable: false,
        public: true,
      });
      // make it public once
      await file.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;

      // console.log("Public url ", publicUrl, "BookId ", bookId);

      // 4) update the book row with image_path
      const updateSQL = `UPDATE books SET image_path = $1 WHERE book_id = $2`;
      await pool.query(updateSQL, [publicUrl, bookId]);

      // reflect it in our response object
      book.image_path = publicUrl;
    }

    // 5) commit the transaction
    await pool.query("COMMIT");
    // console.log(result.rows);

    res.status(201).json({
      book,
      status: "ok",
    });
  } catch (error) {
    // something went wrong — roll back both the INSERT and UPDATE
    await pool.query("ROLLBACK");
    console.error(error.message);
    next(error);
  }
};

// UPDATE BOOK
const updateBook = async (req, res, next) => {
  const owner_id = req.user.id;
  const { book_id } = req.params;

  const {
    title,
    author,
    isbn,
    category,
    publication_date,
    status,
    image_path,
  } = req.body;
  console.log("req file ", req.file);

  console.log("body", req.body);

  try {
    // find category_id
    const categoryDetail = await pool.query(
      "SELECT * FROM categories WHERE category_name = $1",
      [category]
    );
    if (categoryDetail.rows.length === 0) {
      throw new CustomError("Bu turda kategoriya topilmadi", 404);
    }
    // find library id
    const library = await pool.query(
      "SELECT * FROM libraries WHERE owner_id = $1",
      [owner_id]
    );
    if (library.rows.length === 0) {
      throw new CustomError(
        "Hech qanday kutubxona topilmadi bu foydalanuvchi uchun",
        404
      );
    }
    let coverUrl = image_path;

    /// 1) If the client sent a new file, upload it

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const objectPath = `books/${book_id}/${Date.now()}${ext}`;
      const file = storage.bucket(bucketName).file(objectPath);

      // upload buffer directly
      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
        resumable: false,
        public: true,
      });
      // make it public once
      await file.makePublic();
      coverUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;
    }
    const result = await pool.query(
      `UPDATE books 
       SET title = $1, author = $2, isbn = $3, category_id = $4, publication_date = $5, status = $6, image_path = $7
       WHERE library_id = $8 AND book_id = $9 RETURNING *`,
      [
        title,
        author,
        isbn,
        categoryDetail.rows[0].category_id,
        publication_date,
        status,
        coverUrl,
        library.rows[0].library_id,
        book_id,
      ]
    );
    // check if book exists
    if (result.rows.length === 0) {
      throw new CustomError("Kitob topilmadi", 404);
    }

    res.json({
      message: "Kitob muvaffaqiyatli tahrirlandi",
      status: "ok",
      books: result.rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// DELETE BOOK
const deleteBook = async (req, res, next) => {
  const { book_id } = req.params;
  const owner_id = req.user.id;
  try {
    // find library id
    const library = await pool.query(
      "SELECT * FROM libraries WHERE owner_id = $1",
      [owner_id]
    );
    if (library.rows.length === 0) {
      throw new CustomError("Bu foydalanuvchi uchun kutubxona topilmadi", 404);
    }
    const result = await pool.query(
      "DELETE FROM books WHERE library_id = $1 AND book_id = $2 RETURNING * ",
      [library.rows[0].library_id, book_id]
    );
    // check if book exists
    if (result.rows.length === 0) {
      throw new CustomError("Kitob topilmadi!", 404);
    }
    res.status(200).json({
      status: "ok",
      message: "Kitob muvaffaqiyatli o'chirildi",
      books: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
  getBooksBylibray,
  getBookById,
};
