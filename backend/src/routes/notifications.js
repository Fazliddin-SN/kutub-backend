const express = require("express");
const { verifyToken } = require("../middlewares/middlewares.js");
const {
  getNotifications,
  approveNotification,
} = require("../controllers/notificationsController.js");
const router = express.Router();

router.get("/users", verifyToken, getNotifications);
router.post("/:id/read", verifyToken, approveNotification);

module.exports = router;
