const Joi = require("joi");
const {
  userSchema,
  bookSchema,
  librarySchema,
  adminRegisterSchema,
  rentalSchema,
} = require("../validation/schemaValidation");

// user schema validation
const validateUser = (req, res, next) => {
  console.log(req.body);

  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }
  req.body = value;
  next();
};

// book schema validation
const validateBookSchema = (req, res, next) => {
  // console.log("file ", req.file);
  // console.log("request ", req.body);
  const { error, value } = bookSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }
  req.body = value;
  next();
};

// library validation schema
const validateLibrarySchema = (req, res, next) => {
  const { error, value } = librarySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }
  req.body = value;
  next();
};

const valAdminRegisterSchm = (req, res, next) => {
  // console.log("body val adminregister ", req.body);

  const { error, value } = adminRegisterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }
  req.body = value;
  next();
};
const valRentalSchema = (req, res, next) => {
  const { error, value } = rentalSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }
  req.body = value;
  next();
};
module.exports = {
  validateUser,
  validateBookSchema,
  validateLibrarySchema,
  valAdminRegisterSchm,
  valRentalSchema,
};
