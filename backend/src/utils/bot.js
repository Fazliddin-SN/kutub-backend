const { Bot, session } = require("grammy");
const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");
const bcrypt = require("bcrypt");
const { makelinkToken } = require("../middlewares/bot.helper");
const { pool } = require("../config/db");
require("dotenv").config();

// initialize the new bot
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
// Main menu keyboard
const keyboard = [
  ["About Us", "Blog"],
  ["Şartlar", "Services"],
  ["/register", "/login"],
];
// Apply middleware
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

// Define login conversation
async function loginFlow(conversation, ctx) {
  try {
    // getting email
    await ctx.reply("Iltimos emailingizni kiriting!");
    const emailMsg = await conversation.wait();
    // console.log("email msg ", emailMsg.message.text);
    const email = emailMsg.message.text.trim();
    // Authenticate
    const { rows } = await pool.query("SELECT * from users WHERE email = $1", [
      email,
    ]);
    // console.log("rows ", rows);

    // check if the user exists with this email
    if (rows.length === 0) {
      throw new Error("Noto'g'ri emailni kiritdingiz. Qaytadan urining");
    }
    // Ask password
    await ctx.reply(`🔒 Iltimos, parolingizni kiriting!`);
    const passwordMsg = await conversation.wait();
    const password = passwordMsg.message.text.trim();

    //Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      throw new Error("❌ Email yoki Parol xato! Qaytadan urining!");
    }

    await pool.query(
      "UPDATE users SET telegram_chat_id = $1 WHERE user_id = $2",
      [ctx.chat.id, rows[0].user_id]
    );
    const botToken = makelinkToken();
    await pool.query(
      "INSERT INTO telegram_link_tokens (user_id, token) VALUES ($1, $2)",
      [rows[0].user_id, botToken]
    );

    await ctx.reply(
      `✅ Siz muvaffaqiyatli login qildingiz! Ism-Familiya: ${rows[0].full_name}.`
    );
    await ctx.reply("Siz bu yerda eslatmalarni qabul qilasiz!!!");
    return;
  } catch (error) {
    console.error("Login Flow error ", error);
    await ctx.reply(error.message);
    // return await conversation.exit();
  }
}

// Register the conversation under the name login
bot.use(createConversation(loginFlow, "login"));

// /login command to enter that flow
bot.command("login", async (ctx) => {
  await ctx.conversation.enter("login");
});

// /start command: handles deep_link token or guides user
bot.command("start", async (ctx) => {
  ctx.reply("Welcome! Use the menu buttons or commands to interact. ", {
    reply_markup: { keyboard, resize_keyboard: true },
  });
  // console.log("ctx", ctx);
  const parts = (ctx.message.text || "").split(/\s+/);
  const token = parts[1];
  // console.log("token ", token);

  if (!token) {
    return ctx.reply("Login qilish uchun /login buyrug'idan foydalaning!");
  }

  // 1. look up the link token in DB
  const user = await pool.query(
    "SELECT user_id FROM telegram_link_tokens WHERE token = $1",
    [token]
  );

  if (user.rows[0].length === 0) {
    return ctx.reply(
      "Invalid or expired link token. Please request a new link from your Library Profile"
    );
  }

  const userId = user.rows[0].user_id;

  // Save chat id on users records
  await pool.query(
    "UPDATE users SET telegram_chat_id = $1 WHERE user_id = $2",
    [ctx.chat.id, userId]
  );
  // delete
  await pool.query("DELETE FROM telegram_link_tokens WHERE token = $1", [
    token,
  ]);
  // Confirm to user
  ctx.reply(
    "Success! Your telegram has been linked. You will recieve notifications here."
  );
});

module.exports = { bot };
