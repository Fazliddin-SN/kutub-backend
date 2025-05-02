const express = require("express");
const router = express.Router();

// Home endpoint
router.get("/", (req, res) => {
  res.send("Library Management System API");
});
// Mount auth routes
const authRoutes = require("./auth.js");
router.use("/auth", authRoutes);

// Mount book routes
const booksRoutes = require("./books.js");
router.use("/books", booksRoutes);
// Mount rental routes
const rentalRoutes = require("./rentals.js");
router.use("/rentals", rentalRoutes);

// Mount users route
const usersRouter = require("./users.js");
router.use("/users", usersRouter);

// Mount libraries route
const libraryRouter = require("./libraryRoutes.js");
router.use("/library", libraryRouter);

// Mount categories route
const categoriesRouter = require("./categories.js");
router.use("/categories", categoriesRouter);

// Mount notifications js
const notificationsRouter = require("./notifications.js");
router.use("/notifications", notificationsRouter);

module.exports = router;
