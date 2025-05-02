const express = require("express");
const router = express.Router();
const { valRentalSchema } = require("../middlewares/validationMiddleware.js");
const {
  getAllRentals,
  fetchRentalById,
  createRental,
  updateRentalReturn,
  getUserRentals,
  createRequest,
  getRequsts,
  approveRequest,
  getOverdueRentals,
  updateRentalData,
} = require("../controllers/rentalController.js");

//

const { verifyToken, roleGuard } = require("../middlewares/authMiddleware.js");
// Route to get all rentals (for amdin views, for examples)
router.get("/", verifyToken, roleGuard("owner"), getAllRentals);
// fetching all overdue rentals
router.get("/overdue", verifyToken, roleGuard("owner"), getOverdueRentals);
// Route to get a specific rental by its ID
router.get("/:rental_id", fetchRentalById);
// Route to create a new rental (user requets to rent a book)
router.post(
  "/",
  valRentalSchema,
  verifyToken,
  roleGuard("owner"),
  createRental
);
// update the rental data
router.put(
  "/:rentalId/edit",
  verifyToken,
  roleGuard("owner"),
  updateRentalData
);
// Route to mark a rental as returned
router.put("/return", verifyToken, roleGuard("owner"), updateRentalReturn);
// Route to get rental history for a spesific user
router.get("/user/:user_id", getUserRentals);
// Route to create requst for the book
router.post("/request", verifyToken, roleGuard("user", "admin"), createRequest);
// fetch all request
router.get("/requests/details", verifyToken, roleGuard("owner"), getRequsts);
// approve request
router.post(
  "/request/approve",
  verifyToken,
  roleGuard("owner"),
  approveRequest
);
module.exports = router;
