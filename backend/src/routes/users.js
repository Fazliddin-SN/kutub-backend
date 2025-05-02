const express = require("express");

const {
  getAllUser,
  getLibDetails,
  getAllBooksForUsers,
  getBorrowedBooks,
} = require("../controllers/userController.js");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get("/", getAllUser);
// get available books
router.get("/available-books", verifyToken, getAllBooksForUsers);
// get libraries details
router.get("/libraries", verifyToken, getLibDetails);
// get borrowed books
router.get("/borrowed-books", verifyToken, getBorrowedBooks);

module.exports = router;
