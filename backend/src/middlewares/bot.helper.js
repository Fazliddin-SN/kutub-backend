const crypto = require("crypto");

const makelinkToken = () => {
  return crypto.randomBytes(12).toString("hex");
};

module.exports = { makelinkToken };
