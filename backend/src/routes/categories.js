const express = require("express");
const { getCategories } = require("../controllers/categoryController.js");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.get("/", verifyToken, getCategories);

module.exports = router;
