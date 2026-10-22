import pool from "../config/db.js";

export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const userId = req.user.id;

    //Check if category already exists for this user
    const [existingCategories] = await pool.query(
      `SELECT id
             FROM categories
             WHERE user_id = ?
             AND name = ?
             AND type = ?
            `,
      [userId, name, type],
    );

    if (existingCategories.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    //Create Category
    const [result] = await pool.query(
      `INSERT INTO categories (user_id, name, type)
             VALUES (?, ?, ?)
            `,
      [userId, name, type],
    );

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: {
        id: result.insertId,
        name,
        type,
      },
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const [categories] = await pool.query(
      `SELECT id, name, type, created_at
       FROM categories
       WHERE user_id = ?
       ORDER BY name ASC
      `,
      [userId],
    );

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const userId = req.user.id;

    //Check if category belongs to logged-in user
    const [categories] = await pool.query(
      `SELECT id
       FROM categories
       WHERE id = ?
       AND user_id = ?
      `,
      [id, userId],
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    //Prevent changing the type of a category already used
    //by existing transactions.

    if (categories.length > 0) {
      const [currentCategoryRows] = await pool.query(
        `SELECT type FROM categories WHERE id = ? AND user_id = ?`,
        [id, userId],
      );

      const currentType = currentCategoryRows[0].type;

      if (currentType !== type) {
        const [transactions] = await pool.query(
          `SELECT id
           FROM transactions
           WHERE category_id = ?
           LIMIT 1
          `,
          [id],
        );

        if (transactions.length > 0) {
          return res.status(409).json({
            success: false,
            message:
              "Cannot change the category type because it is already used by transactions.",
          });
        }
      }
    }

    //Check for duplicate category name and type
    const [existingCategories] = await pool.query(
      `SELECT id
       FROM categories
       WHERE user_id = ?
       AND name = ?
       AND type = ?
       AND id != ?
      `,
      [userId, name, type, id],
    );

    if (existingCategories.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    //Update category
    await pool.query(
      `UPDATE categories
         SET name = ?, type = ?
         WHERE id = ?
         AND user_id = ?
        `,
      [name, type, id, userId],
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: {
        id: Number(id),
        name,
        type,
      },
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    //Check if category belongs to logged-in user
    const [categories] = await pool.query(
      `SELECT id
       FROM categories
       WHERE id = ?
       AND user_id = ?
      `,
      [id, userId],
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    //Check whether category is being used by transactions
    const [transactions] = await pool.query(
      `SELECT id
       FROM transactions 
       WHERE category_id = ?
       LIMIT 1
      `,
      [id],
    );

    if (transactions.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete because it is being used by transactions",
      });
    }

    //Delete Category
    await pool.query(
      `DELETE FROM categories
       WHERE id = ?
       AND user_id = ?
      `,
      [id, userId],
    );

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
