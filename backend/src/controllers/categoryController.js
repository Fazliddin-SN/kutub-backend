const { pool } = require("../config/db.js");
const { CustomError } = require("../utils/customError.js");
// fetching all categories

const getCategories = async (req, res, next) => {
  try {
    const categories = await pool.query(
      "SELECT category_id, category_name FROM categories"
    );

    if (categories.rows.length === 0) {
      throw new CustomError("Hech qanday kategoriya topilmadi!", 404);
    }
    // console.log(categories.rows);

    res.status(200).json({
      categories: categories.rows,
    });
  } catch (error) {
    console.error(error.message);
    next();
  }
};

module.exports = { getCategories };
