const { pool } = require("../config/db");

// require("dotenv").config();
// const nodemailer = require("nodemailer");
// // configure your SMTP transporter
// const transporter = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: +process.env.MAIL_PORT,
//   secure: !!process.env.MAIL_SECURE,
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

const cron = require("node-cron");

export const insertReminder = async (rental, daysLeft) => {
  const msg = `Assalom-u alaykum ${rental.username}, sizning "${rental.title}" kitobingiz ${daysLeft} kun ichida qaytarilishi kerak.`;

  await pool.query(
    `INSERT INTO notifications user_id, rental_id, type, message VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
    [rental.user_id, rental.rental_id, "due_reminder", msg]
  );
};

const checkAndNotifyOverdueRentals = async () => {
  const { rows: overdueRentals } = await pool.query(`
    SELECT r.rental_id, r.user_id FROM rentals r WHERE r.return_date IS NULL AND r.due_date < NOW() AND r.status = 'jarayonda'
  `);

  for (const rental of overdueRentals) {
    await pool.query(
      `
      INSERT INTO notifications (user_id, rental_id, type, message, is_read) VALUES ($1, $2, 'overdue', 'Siz ijaraga olgan kitobni hali qaytarmadingiz.', FALSE) ON CONFLICT DO NOTHING
    `,
      [rental.user_id, rental.rental_id]
    );
  }

  console.log(`Overdue check completed. Total: ${overdueRentals.length}`);
};

// Cron job: Runs every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  try {
    console.log("Running daily rental check...");

    await checkAndNotifyOverdueRentals();

    const { rows } = await pool.query(`
      SELECT r.rental_id, r.user_id, r.book_id, r.due_date::date - CURRENT_DATE AS days_left, b.title, u.full_name AS username FROM rentals r JOIN books b ON b.book_id = r.book_id JOIN users u ON u.user_id = r.user_id WHERE r.status = 'jarayonda' AND r.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
    `);

    for (let rent of rows) {
      await insertReminder(rent, rent.days_left);
    }

    console.log("Due-date reminders inserted:", rows.length);
  } catch (error) {
    console.error("Reminder cron error:", error);
  }
});
