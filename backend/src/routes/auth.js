const express = require("express");
const router = express.Router();
const { register, login, authMe } = require("../controllers/authController.js");
const { signUp } = require("../controllers/admin/adminActions.js");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware.js");
const {
  validateUser,
  valAdminRegisterSchm,
} = require("../middlewares/validationMiddleware.js");

// Registration endpoint
router.post("/register", validateUser, register);

router.post(
  "/sign-up",
  valAdminRegisterSchm,
  verifyToken,
  roleGuard("admin"),
  signUp
);
//Login endpoint
router.post("/login", login);
router.get("/me", verifyToken, authMe);
module.exports = router;
