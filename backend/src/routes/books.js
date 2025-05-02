const express = require("express");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uplaod.js");
const router = express.Router();
const {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
  getBookById,
  // getBooksBylibray,
} = require("../controllers/bookController.js");
const {
  validateBookSchema,
} = require("../middlewares/validationMiddleware.js");
const { getAllBooksForUsers } = require("../controllers/userController.js");
// Define routes for book CRUD operations
router.get("/", verifyToken, roleGuard("owner", "user"), getAllBooks);
router.post(
  "/add",
  upload.single("image"),
  validateBookSchema,
  verifyToken,
  roleGuard("owner"),
  addBook
);
router.put(
  "/update/:book_id",
  upload.single("image"),
  validateBookSchema,
  verifyToken,
  roleGuard("owner"),
  updateBook
);
router.delete("/:book_id", verifyToken, roleGuard("owner"), deleteBook);
router.get("/list", verifyToken, roleGuard("user"), getAllBooksForUsers);
router.get("/:book_id", verifyToken, roleGuard("owner", "admin"), getBookById);
module.exports = router;
