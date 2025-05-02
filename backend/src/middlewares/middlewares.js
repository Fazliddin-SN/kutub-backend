const authMiddleware = require("../middlewares/authMiddleware.js");
const validationMiddleware = require("../middlewares/validationMiddleware.js");
module.exports = { ...authMiddleware, ...validationMiddleware };
