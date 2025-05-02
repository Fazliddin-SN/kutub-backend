const express = require("express");
const router = express.Router();
const {
  register,
  login,
  authMe,
  updateUser,
} = require("../controllers/authController.js");
const { signUp } = require("../controllers/admin/adminActions.js");
const { verifyToken, roleGuard } = require("../middlewares/authMiddleware.js");
const {
  validateUser,
  valAdminRegisterSchm,
} = require("../middlewares/validationMiddleware.js");
const upload = require("../middlewares/uplaod.js");
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
// getting user details for all type of users
router.get("/me", verifyToken, authMe);

// update some of user data and add avatar
router.put("/update", upload.single("avatar"), verifyToken, updateUser);

module.exports = router;
