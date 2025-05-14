const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const { connectDB } = require("./config/db.js");
const errorHandler = require("./utils/errorHandler.js");
require("./utils/scheduler.js");
const { bot } = require("./utils/bot.js");
const port = process.env.PORT || 3017;

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
// connect to DB
connectDB();
// // Log bot startup by fetching getMe()
// bot.api
//   .getMe()
//   .then((botInfo) =>
//     console.log(`🤖 Bot @${botInfo.username} is up and running.`)
//   )
//   .catch((err) => console.error("Bot startup failed:", err));

// // Begin polling
// bot.start();

// Import and use routes
const indexRouter = require("./routes/index.js");
app.use("/", indexRouter);

// gloabal error handler
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
