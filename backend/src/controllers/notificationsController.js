const { pool } = require("../config/db.js");
const { CustomError } = require("../utils/customError.js");
const { bot } = require("../utils/bot.js");

// Format dates as YYYY-MM_DD
const fmt = (d) =>
  d.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tashkent",
  });

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

// bot notifications

// notifying the member
async function notifyMember(
  chatId,
  bookName,
  libraryName,
  rentalDate,
  dueDate,
  expectedReturnDate,
  actual_return_date
) {
  if (actual_return_date !== null && actual_return_date) {
    const text = `
🎉 <b>Siz ijara olgan kitobni qaytarib berdingiz!!!</b>

📖 <b>Kitob nomi:</b> «${bookName}»  
🏛️ <b>Kutubxona:</b> «${libraryName}»  
🗓️ <b>Ijara sanasi:</b> ${rentalDate}  
🔔 <b>Ogohlantirish sanasi:</b> ${dueDate}  
⏳ <b>Qaytarilish sanasi:</b> ${actual_return_date}


<i>Muvaffaqiyatli o‘qish tilaymiz!</i>
`;
    return await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
  }
  const text = `
🎉 <b>Siz kitob ijaraga oldingiz!</b>

📖 <b>Kitob nomi:</b> «${bookName}»  
🏛️ <b>Kutubxona:</b> «${libraryName}»  
🗓️ <b>Ijara sanasi:</b> ${rentalDate}  
🔔 <b>Ogohlantirish sanasi:</b> ${dueDate}  
⏳ <b>Qaytarilish sanasi:</b> ${expectedReturnDate}

<i>Muvaffaqiyatli o‘qish tilaymiz!</i>
`;
  await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
}

// when a new rental is made
async function notifyOwner(
  chatId,
  userName,
  bookName,
  rentalDate,
  dueDate,
  expectedReturnDate,
  actual_return_date
) {
  if (actual_return_date !== null && actual_return_date) {
    const text = `
━━━━━━━━━━━━━━━
📚 * ijara olingan kitob qaytarib berildi!*
━━━━━━━━━━━━━━━

👤 *Foydalanuvchi:* _${userName}_
📖 *Kitob:*        _${bookName}_
📅 *Ijara Sanasi*:        _${rentalDate}_
🔔 *Eslatma Sanasi:*      _${dueDate}_
⏳ *Qaytarilish Sanasi:*    _${actual_return_date}_
`;

    return await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
  }

  const text = `
━━━━━━━━━━━━━━━
📚 *Yangi ijara*
━━━━━━━━━━━━━━━

👤 *Foydalanuvchi:* _${userName}_
📖 *Kitob:*        _${bookName}_
📅 *Ijara*:        _${rentalDate}_
🔔 *Eslatma:*      _${dueDate}_
⏳ *Qaytarish:*    _${expectedReturnDate}_
`;

  await bot.api.sendMessage(chatId, text, { parse_mode: "Markdown" });
}

// this notifies the members about how many days left to return a book
async function notifyMemForBookReturn(
  chatId,
  bookName,
  rentalDate,
  libname,
  daysleft,
  rentalDate
) {
  // console.log("chat ids book name ", chatId, bookName, daysleft);

  const text = `
⏰ <b>Eslatma!</b>

📚 <b>Kitob nomi:</b> «${bookName}»  
📅 <b>Ijara boshlangan sana:</b> ${fmt(rentalDate)}  
⏳ <b>Qaytarishga qolgan muddat:</b> ${daysleft} kun  
🏛️ <b>Kutubxona:</b> «${libname}»

<i>Iltimos, kitobni belgilangan muddatda qaytarishni unutmang!</i>
`;

  if (daysleft === 0 && chatId) {
    const rentedOn = rentalDate.toISOString().split("T")[0];
    const borrowerMsg = `
🚨 <b>Eslatma!</b>

📚 <b>Kitob:</b> «${bookName}»  
🏛️ <b>Kutubxona:</b> «${libname}»

⏰ <b>Bugun qaytarish muddati tugadi!</b>  
🗓️ <b>Ijara boshlangan sana:</b> ${fmt(rentedOn)}

🙏 <i>Iltimos, kitobni kechiktirmasdan qaytarib bering.</i>
`;

    return await bot.api.sendMessage(chatId, borrowerMsg, {
      parse_mode: "HTML",
    });
  }
  return await bot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
}

/// notify owner about book return actions
async function notifyOwnerForBookReturn(
  chatId,
  bookName,
  user_name,
  daysLeft,
  rentalDate
) {
  if (daysLeft === 0 && chatId) {
    const rentedOn = rentalDate.toISOString().split("T")[0];
    const ownerMsg = `
📣 <b>Eslatma!</b>

👤 <b>Foydalanuvchi:</b> ${row.username}  
📖 <b>Kitob:</b> «${row.title}»  
⏰ <b>Bugun qaytarish vaqti!</b>  
🗓️ <b>Ijara sanasi:</b> ${fmt(rentedOn)}

🙏 <i>Iltimos, kitobni qabul qilib olishingizni unutmang.</i>
`;

    return await bot.api.sendMessage(chatId, ownerMsg, { parse_mode: "HTML" });
  }
  const ownerMsg = `
🚨 <b>Eslatma!</b>

👤 <b>Foydalanuvchi:</b> ${user_name}  
📚 <b>Kitob nomi:</b> «${bookName}»  
⏳ <b>Qaytarishga qolgan muddat:</b> ${daysLeft} kun  

🙏 <i>Iltimos, muddatni nazorat qilib, kitobni o‘z vaqtida qabul qilishingizni unutmang.</i>
`;
  return await bot.api.sendMessage(chatId, ownerMsg, { parse_mode: "HTML" });
}

// notify when any book is marked as returned
async function notif() {}
module.exports = {
  approveNotification,
  getNotifications,
  notifyMember,
  notifyOwner,
  notifyMemForBookReturn,
  notifyOwnerForBookReturn,
};
