const Joi = require("joi");

// simple user register schema
const adminRegisterSchema = Joi.object({
  full_name: Joi.string().min(8).required().messages({
    "string.base": "Ism-familiya string bo'lishi kerak.",
    "string.empty": "Ism-familiya bo'sh bo'lmasligi kerak.",
    "string.min": "Ism-familiya kamida 5 harfdan iborat bo'lishi kerak.",
    "any.required": "Ism-familiya talab qilinadi.",
  }),
  username: Joi.string().min(3).required().messages({
    "string.base": "user name string bo'lishi kerak.",
    "string.empty": "user name bo'sh bo'lmasligi kerak.",
    "string.min": "user name kamida 5 harfdan iborat bo'lishi kerak.",
    "any.required": "user name talab qilinadi.",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email string shaklida bo'lishi kerak",
    "string.empty": "Email bo'sh bo'lmasligi kerak.",
    "string.email": "Iltimos yaroqli emailni kiriting",
    "any.required": "Email talab qilinadi",
  }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$"))
    .messages({
      "string.base": "Parol string shaklida bo'lishi kerak ",
      "string.empty": "Parol bo'sh bo'lmasligi kerak.",
      "string.min": "Parol 6 harf uzunligida bo'lishi kerak.",
      "string.pattern.base":
        "Parol kamida bitta kichkina va katta harflardan va raqamlardan iborat bo'lishi kerak.",
      "any.required": "Parol talab qilinadi",
    }),
  address: Joi.string().min(5).max(100).required().messages({
    "string.base": "Address string shaklida bo'lishi kerak",
    "string.empty": "Address bo'sh bo'lmasligi kerak",
    "string.min": "Address kamida 5 harf uzunligida bo'lishi kerak",
    "string.max": "Address ko'pi bilan 100 harf uzunligida bo'lishi kerak",
    "any.required": "Address talab qilinadi.",
  }),
  phone_number: Joi.string()
    .pattern(/^\+998\d{9}$/)
    .required()
    .messages({
      "string.base": "Telefon raqami string shaklida bo'lishi kerak",
      "string.empty": "Telefon raqami talab qilinadi",
      "string.pattern.base":
        "Telefon raqami quydagi shaklda bo'lishi kerak: +998941234567",
      "any.required": "Telefon raqami talab qilinadi.",
    }),
  role: Joi.string().valid("admin", "user", "owner").messages({
    "string.base": "Role string shaklida bo'lishi kerak",
    "any.only": "Role admin, user yoki owner shaklida bo'lishi kerak",
    "any.required": "Role talab qilinadi.",
  }),
});

// admin can register users schema
const userSchema = Joi.object({
  full_name: Joi.string().min(8).required().messages({
    "string.base": "Ism-familiya string bo'lishi kerak.",
    "string.empty": "Ism-familiya bo'sh bo'lmasligi kerak.",
    "string.min": "Ism-familiya kamida 5 harfdan iborat bo'lishi kerak.",
    "any.required": "Ism-familiya talab qilinadi.",
  }),
  username: Joi.string().min(3).required().messages({
    "string.base": "user name string bo'lishi kerak.",
    "string.empty": "user name bo'sh bo'lmasligi kerak.",
    "string.min": "user name kamida 5 harfdan iborat bo'lishi kerak.",
    "any.required": "user name talab qilinadi.",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email string shaklida bo'lishi kerak",
    "string.empty": "Email bo'sh bo'lmasligi kerak.",
    "string.email": "Iltimos yaroqli emailni kiriting",
    "any.required": "Email talab qilinadi",
  }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$"))
    .messages({
      "string.base": "Parol string shaklida bo'lishi kerak ",
      "string.empty": "Parol bo'sh bo'lmasligi kerak.",
      "string.min": "Parol 6 harf uzunligida bo'lishi kerak.",
      "string.pattern.base":
        "Parol kamida bitta kichkina va katta harflardan va raqamlardan iborat bo'lishi kerak.",
      "any.required": "Parol talab qilinadi",
    }),
  address: Joi.string().min(5).max(100).required().messages({
    "string.base": "Address string shaklida bo'lishi kerak",
    "string.empty": "Address bo'sh bo'lmasligi kerak",
    "string.min": "Address kamida 5 harf uzunligida bo'lishi kerak",
    "string.max": "Address ko'pi bilan 100 harf uzunligida bo'lishi kerak",
    "any.required": "Address talab qilinadi.",
  }),
  phonenumber: Joi.string()
    .pattern(/^\+998\d{9}$/)
    .required()
    .messages({
      "string.base": "Telefon raqami string shaklida bo'lishi kerak",
      "string.empty": "Telefon raqami talab qilinadi",
      "string.pattern.base":
        "Telefon raqami quydagi shaklda bo'lishi kerak: +998941234567",
      "any.required": "Telefon raqami talab qilinadi.",
    }),
});
// bookSchema validator

const bookSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "string.base": "Kitob nomi string shaklida bo'lishi kerak",
    "string.empty": "Kitob nomi bo'sh bo'lmasligi kerak",
    "string.min": "Kitob nomi kamida 3 ta harfdan iborat bo'lishi kerak",
    "string.max": "Kitob nomi 150 harfdan oshmasligi kerak",
    "any.required": "Kitob nomi talab qilinadi",
  }),
  image: Joi.object(),
  author: Joi.string().min(3).max(100).required().messages({
    "string.base": "Muallif ismi string shaklida bo'lish kerak",
    "string.empty": "Muallif ismi bo'sh bo'lmasligi kerak",
    "string.min": "Muallif ismi kamida 3 harfdan iborat bo'lishi kerak",
    "string.max": "Muallif ismi 150 harfdan oshmaligi kerak",
    "any.required": "Muallif ismi talab qilinadi",
  }),
  isbn: Joi.string().required().messages({
    "any.required": "ISBN talab qilinadi.",
    "alternatives.match": "ISBN ISBN-10 yoki ISBN-13 shaklida bo'lishi kerak",
  }),
  category: Joi.string(),
  status: Joi.string().valid("mavjud", "ijarada").messages({
    "string.base": "Status string shaklida bo'lishi kerak",
    "any.only": "Status 'mavjud' yoki 'ijarada' shaklida bo'lishi kerak",
    "any.required": "Status talab qilinadi.",
  }),
  publication_date: Joi.date().iso().required().messages({
    "date.base": "Nashr sanasi sting shaklida bo'lishi kerak",
    "date.format":
      "Nash sanasi quyidagi shaklda bo'lishi kerak: (e.g., 2023-03-19)",
    "any.required": "Nashr sanasi talab qilinadi",
  }),
});

// library SChema controller
const librarySchema = Joi.object({
  library_name: Joi.string().min(3).max(80).required().messages({
    "string.base": "Kutubxona nomi string shaklida bo'lish kerak",
    "string.empty": "Kutubxona nomi bo'sh bo'lmasligi kerak",
    "string.min": "Kutubxona nomi kamida 3 harfdan iborat bo'lishi kerak",
    "string.max": "Kutubxona nomi 80 harfdan oshmaligi kerak",
    "any.required": "Kutubxona nomi talab qilinadi",
  }),
  user_email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.base": "Email string shaklida bo'lishi kerak",
      "string.empty": "Email bo'sh bo'lmasligi kerak.",
      "string.email": "Iltimos yaroqli emailni kiriting",
      "any.required": "Email talab qilinadi",
    }),
});

// rental Schema validation
const rentalSchema = Joi.object({
  user_id: Joi.number(),
  book_id: Joi.number(),
  rental_date: Joi.date().required(),
  due_date: Joi.date().min(Joi.ref("rental_date")).required().messages({
    "date.min": "Ogohlantiruvchi sana ijara sanasidan oldin bo'lmasligi kerak!",
  }),
  return_date: Joi.date()
    .required()
    .custom((value, helpers) => {
      const { rental_date, due_date } = helpers.state.ancestors[0];
      if (value < rental_date) {
        return helpers.error("date_min", { limit: rental_date });
      }
      if (value < due_date) {
        return helpers.error("date_min", { limit: due_date });
      }
      return value;
    })
    .messages({
      date_min:
        "Qaytarish sanasi ijara sanasi va ogohlantirish sanasidan oldin bo'lmasligi kerak!",
    }),
});

module.exports = {
  userSchema,
  bookSchema,
  librarySchema,
  adminRegisterSchema,
  rentalSchema,
};
