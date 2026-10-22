import pool from "../config/db.js";

export const createTransaction = async (req, res) => {
  try {
    const { categoryId, type, amount, description, transactionDate } = req.body;

    const userId = req.user.id;

    //Check category ownership and type
    const [categories] = await pool.query(
      `SELECT id, name, type
             FROM categories
             WHERE id = ?
             AND user_id = ?
            `,
      [categoryId, userId],
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const category = categories[0];

    //Make sure transaction type matches category type
    if (category.type !== type) {
      return res.status(400).json({
        success: false,
        message: "Transaction type does not match category type",
      });
    }

    //Create Transaction
    const [result] = await pool.query(
      `INSERT INTO transactions
             (user_id, category_id, type, amount, description, transaction_date)
             VALUES (?, ?, ?, ?, ?, ?)
            `,
      [userId, categoryId, type, amount, description || null, transactionDate],
    );

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction: {
        id: result.insertId,
        categoryId: Number(categoryId),
        categoryName: category.name,
        type,
        amount: Number(amount),
        description: description || null,
        transactionDate,
      },
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      page = 1,
      limit = 10,
      type,
      categoryId,
      search,
      startDate,
      endDate,
      sortBy = "transaction_date",
      sortOrder = "desc",
    } = req.query;

    //Pagination
    const currentPage = Math.max(Number(page) || 1, 1);

    const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const offset = (currentPage - 1) * currentLimit;
    //Allowed filters
    const allowedTypes = ["income", "expense"];

    const allowedSortColumns = {
      transaction_date: "t.transaction_date",
      amount: "t.amount",
      created_at: "t.created_at",
      category: "c.name",
    };

    //Validate type
    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type",
      });
    }

    //Validate category ID
    if (
      categoryId !== undefined &&
      (!Number.isInteger(Number(categoryId)) || Number(categoryId) < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Category ID must be positive integer",
      });
    }

    //Validate dates
    if (startDate && Number.isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (endDate && Number.isNaN(Date.parse(endDate))) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date",
      });
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    //Validate sorting
    const orderByColumn =
      allowedSortColumns[sortBy] || allowedSortColumns.transaction_date;

    const order = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    //Build WHERE conditions
    const conditions = ["t.user_id = ?"];
    const queryParams = [userId];

    if (type) {
      conditions.push("t.type = ?");
      queryParams.push(type);
    }

    if (categoryId) {
      conditions.push("t.category_id = ?");
      queryParams.push(Number(categoryId));
    }

    if (search && search.trim()) {
      const searchValue = `%${search.trim()}%`;

      conditions.push(
        "(t.description LIKE ? OR c.name LIKE ? OR t.type LIKE ?)",
      );

      queryParams.push(searchValue, searchValue, searchValue);
    }

    if (startDate) {
      conditions.push("t.transaction_date >= ?");
      queryParams.push(startDate);
    }

    if (endDate) {
      conditions.push("t.transaction_date <= ?");
      queryParams.push(endDate);
    }

    const whereClause = conditions.join(" AND ");

    //Get Transactions
    const [transactions] = await pool.query(
      `SELECT
                t.id,
                t.type,
                t.amount,
                t.description,
                t.transaction_date AS transactionDate,
                t.created_at AS createdAt,
                c.id AS categoryId,
                c.name AS categoryName
            FROM transactions t
            INNER JOIN categories c
                ON t.category_id = c.id
            WHERE ${whereClause}
            ORDER BY ${orderByColumn} ${order}, t.id DESC
            LIMIT ? OFFSET ?
            `,
      [...queryParams, currentLimit, offset],
    );

    //Get total Matching transactions
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM transactions t
       INNER JOIN categories c
         ON t.category_id = c.id
       WHERE ${whereClause}
       `,
      queryParams,
    );

    const total = Number(countResult[0].total);

    const totalPages = Math.ceil(total / currentLimit);

    return res.status(200).json({
      success: true,
      message: "Transaction fetched successfully",
      data: {
        transactions,
        pagination: {
          page: currentPage,
          limit: currentLimit,
          total,
          totalPages,
        },
        filters: {
          type: type || null,
          categoryId: categoryId ? Number(categoryId) : null,
          search: search || null,
          startDate: startDate || null,
          endDate: endDate || null,
          sortBy,
          sortOrder: order.toLowerCase(),
        },
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const { categoryId, type, amount, description, transactionDate } = req.body;

    const userId = req.user.id;

    //Check whether transaction belongs to logged-in user
    const [transactions] = await pool.query(
      `SELECT id
             FROM transactions
             WHERE id = ?
             AND user_id = ?
            `,
      [id, userId],
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    //Check category ownership
    const [categories] = await pool.query(
      `SELECT id, name, type
             FROM categories
             WHERE id = ?
             AND user_id = ?
            `,
      [categoryId, userId],
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const category = categories[0];

    //Check transaction type matches category type
    if (category.type !== type) {
      return res.status(400).json({
        success: false,
        message: "Transaction type does not match category type",
      });
    }

    //Update transaction
    await pool.query(
      `UPDATE transactions
             SET category_id = ?,
                 type = ?,
                 amount = ?,
                 description = ?,
                 transaction_date = ?
             WHERE id = ?
             AND user_id = ?                
            `,
      [
        categoryId,
        type,
        amount,
        description || null,
        transactionDate,
        id,
        userId,
      ],
    );

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      transaction: {
        id: Number(id),
        categoryId: Number(categoryId),
        categoryName: category.name,
        type,
        amount: Number(amount),
        description: description || null,
        transactionDate,
      },
    });
  } catch (error) {
    console.error("Update transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    //Check whether transaction belongs to logged-in user
    const [transactions] = await pool.query(
      `SELECT id 
             FROM transactions
             WHERE id = ?
             AND user_id = ?
            `,
      [id, userId],
    );

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    //Delete transaction
    await pool.query(
      `DELETE FROM transactions
             WHERE id = ?
             AND user_id = ?
            `,
      [id, userId],
    );

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [summaryResult] = await pool.query(
      `SELECT
                COALESCE(
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END),
                    0
                ) AS totalIncome,

                COALESCE(
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END),
                    0
                ) AS totalExpenses
            FROM transactions
            WHERE user_id = ?
            `,
      [userId],
    );

    const totalIncome = Number(summaryResult[0].totalIncome);
    const totalExpenses = Number(summaryResult[0].totalExpenses);

    const balance = totalIncome - totalExpenses;

    return res.status(200).json({
      success: true,
      message: "Transaction summary fetched successfully",
      summary: {
        totalIncome,
        totalExpenses,
        balance,
      },
    });
  } catch (error) {
    console.error("Get transaction summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [monthlySummary] = await pool.query(
      `SELECT
          DATE_FORMAT(transaction_date, '%Y-%m') AS month,

          COALESCE(
            SUM(CASE
                WHEN type = 'income' THEN amount
                ELSE 0
               END),
              0
          ) AS totalIncome,

           COALESCE(
            SUM(CASE
                WHEN type = 'expense' THEN amount
                ELSE 0
               END),
              0
          ) AS totalExpenses

       FROM transactions
       WHERE user_id = ?
       GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
       ORDER BY month ASC
      `,
      [userId],
    );

    const formattedSummary = monthlySummary.map((item) => {
      const totalIncome = Number(item.totalIncome);
      const totalExpenses = Number(item.totalExpenses);

      return {
        month: item.month,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Monthly transaction summary fetched successfully",
      summary: formattedSummary,
    });
  } catch (error) {
    console.error("Get monthly summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCategoryExpenseSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const [categorySummary] = await pool.query(
      `SELECT
          c.id AS categoryId,
          c.name AS categoryName,
          COALESCE(SUM(t.amount), 0) AS totalAmount
      
       FROM transactions t
       INNER JOIN categories c
          ON t.category_id = c.id
      
       WHERE t.user_id = ?
          AND t.type = 'expense'
      
       GROUP BY c.id, c.name
       ORDER BY totalamount DESC
      `,
      [userId],
    );

    const formattedSummary = categorySummary.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      totalAmount: Number(item.totalAmount),
    }));

    return res.status(200).json({
      success: true,
      message: "Category-wise expense summary fetched successfully",
      summary: formattedSummary,
    });
  } catch (error) {
    console.error("Get category expense summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
