const db = require("../config/db");

const addExpense = (req, res) => {
  const {
    entry_month,
    rent,
    electricity,
    staff_salary,
    due_date,
    amount_paid,
    status
  } = req.body;
  const normalizedMonth = String(entry_month || "").trim();

  if (!normalizedMonth) {
    return res.status(400).json({ message: "Month is required." });
  }

  const createdAt = new Date();
  db.query(
    `INSERT INTO expenses
      (entry_month, rent, electricity, staff_salary, due_date, amount_paid, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      normalizedMonth,
      Number(rent || 0),
      Number(electricity || 0),
      Number(staff_salary || 0),
      due_date || null,
      Number(amount_paid || 0),
      String(status || "Pending"),
      createdAt
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({ success: true, message: "Expense saved successfully." });
    }
  );
};

const getExpenses = (req, res) => {
  db.query(
    `SELECT id, entry_month, rent, electricity, staff_salary, amount_paid, due_date, status, created_at FROM expenses ORDER BY created_at DESC`,
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
};

const markExpensePaid = (req, res) => {
  const expenseId = Number(req.params.id);
  if (!expenseId) {
    return res.status(400).json({ message: "Invalid expense id." });
  }

  db.query(
    `UPDATE expenses
      SET amount_paid = COALESCE(rent, 0) + COALESCE(electricity, 0) + COALESCE(staff_salary, 0),
          status = 'Paid'
      WHERE id = ?`,
    [expenseId],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Expense record not found." });
      }
      res.json({ success: true, message: "Expense marked paid." });
    }
  );
};

module.exports = {
  addExpense,
  getExpenses,
  markExpensePaid
};
