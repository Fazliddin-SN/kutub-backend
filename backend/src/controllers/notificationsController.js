const { pool } = require("../config/db.js");
const { CustomError } = require("../utils/customError.js");

// fetching notifications for the user with the userId
const getNotifications = async (req, res, next) => {
  const userId = req.query.userId;
  try {
    const { rows } = await pool.query(
      "SELECT notification_id, rental_id, type, message, is_read, created_at FROM notifications WHERE user_id = $1 ORDER by created_at DESC LIMIT 20",
      [userId]
    );
    if (rows.length === 0) {
      throw new CustomError("Siz uchun eslatmalar topilmadi", 404);
    }

    res.status(200).json({
      status: "ok",
      notifications: rows,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// when user read the notifications and approve it
const approveNotification = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE notification_id = $1 AND user_id = $2",
      [id, userId]
    );

    res.status(204).json({
      message: `Notification with the id: ${id} is updated!`,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  approveNotification,
  getNotifications,
};
