const db = require("../config/db");

const getStats = (req, res) => {
  db.query(
    `
    SELECT
      (SELECT COUNT(*) FROM products) AS totalProducts,

      (SELECT COUNT(*) FROM customers) AS totalCustomers,

      (SELECT COUNT(*) FROM transactions) AS totalSales,

      (SELECT IFNULL(SUM(grand_total),0)
       FROM transactions) AS revenue,

      (SELECT IFNULL(SUM(amount),0)
       FROM expenses) AS expenses,

      (SELECT COUNT(*)
       FROM products
       WHERE stock <= min_stock) AS lowStockCount,

      (SELECT COUNT(*)
       FROM transactions
       WHERE DATE(date)=CURDATE()) AS todaySales,

      (SELECT IFNULL(SUM(grand_total),0)
       FROM transactions
       WHERE DATE(date)=CURDATE()) AS todayRevenue
    `,
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      const data = result[0];

      const revenue =
        Number(data.revenue);

      const expenses =
        Number(data.expenses);

      const profit =
        revenue - expenses;

      const todayProfit =
        Number(data.todayRevenue) -
        expenses;

      res.json({
        ...data,
        revenue,
        expenses,
        profit,
        todayProfit
      });
    }
  );
}; 
const getMonthlySales = (req, res) => {
  db.query(
    `
    SELECT
      MONTH(date) AS month_no,
      DATE_FORMAT(date,'%b') AS month,
      SUM(grand_total) AS revenue
    FROM transactions
    GROUP BY month_no, month
    ORDER BY month_no
    `,
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
};

const getTopProducts = (req, res) => {
  db.query(
    `
    SELECT
      name,
      SUM(qty) AS total_sold
    FROM transaction_items
    GROUP BY name
    ORDER BY total_sold DESC
    LIMIT 5
    `,
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
};
module.exports = {
  getStats,
  getMonthlySales,
  getTopProducts,
};