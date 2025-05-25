const cron = require("node-cron");
const {
  notifyMemForBookReturn,
  notifyOwnerForBookReturn,
} = require("../controllers/notificationsController");
const { pool } = require("../config/db");

cron.schedule(
  `0 9 * * * `,
  async () => {
    console.log(
      `[Scheduler] Running reminder task at ${new Date().toISOString()}`
    );

    const today = new Date();
    // start reminders 3 days before expected return
    const todayDateStr = today.toISOString().split("T")[0];
    // console.log("today date str ", todayDateStr);

    //Find rentals where today is between due_date and expected_return_Date
    const result = await pool.query(
      "SELECT lib.library_name, u.username, r.rental_id, r.due_date, r.return_date, r.rental_date, b.title, u.telegram_chat_id AS user_chat, o.telegram_chat_id AS owner_chat FROM rentals r JOIN books b ON r.book_id = b.book_id JOIN users u ON r.user_id = u.user_id JOIN users o ON r.owner_id = o.user_id JOIN libraries lib ON r.owner_id = lib.owner_id WHERE r.actual_return_date is null AND DATE(r.due_date) >= $1 AND DATE(r.return_date) >= $1",
      [todayDateStr]
    );
    // console.log("result ", result.rows);

    // console.log("rows ", result.rows);

    for (const row of result.rows) {
      const due = new Date(row.due_date);
      const expReturn = new Date(row.return_date);
      const msPerDay = 1000 * 60 * 60 * 24;
      const daysLeft = Math.ceil((expReturn - today) / msPerDay);
      // console.log("days left ", daysLeft);

      if (daysLeft >= 0) {
        if (row.user_chat)
          await notifyMemForBookReturn(
            row.user_chat,
            row.title,
            row.rental_date,
            row.library_name,
            daysLeft,
            row.rental_date
          );
        if (row.owner_chat)
          await notifyOwnerForBookReturn(
            row.owner_chat,
            row.title,
            row.username,
            daysLeft,
            row.rental_date
          );
      }
    }
  },
  { timezone: "Asia/Tashkent" }
);
