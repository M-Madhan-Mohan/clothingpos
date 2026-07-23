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

      (SELECT IFNULL(SUM(rent + electricity + staff_salary),0)
       FROM expenses) AS expenses,

      (SELECT COUNT(*)
       FROM products
       WHERE stock <= min_stock) AS lowStockCount,

      (SELECT COUNT(*)
       FROM transactions
       WHERE DATE(date)=CURDATE()) AS todaySales,

      (SELECT IFNULL(SUM(grand_total),0)
       FROM transactions
       WHERE DATE(date)=CURDATE()) AS todayRevenue,

      (SELECT IFNULL(SUM(gst_amount),0)
       FROM transactions
       WHERE DATE(date)=CURDATE()) AS todayGst
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

const getAnalytics = (req, res) => {
  db.query(
    `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS sale_date, IFNULL(SUM(grand_total), 0) AS revenue
     FROM transactions
     WHERE date >= CURDATE() - INTERVAL 6 DAY
     GROUP BY DATE_FORMAT(date, '%Y-%m-%d')
     ORDER BY sale_date`,
    (trendError, trendRows) => {
      if (trendError) return res.status(500).json(trendError);

      db.query(
        `SELECT COALESCE(NULLIF(p.category, ''), 'Uncategorized') AS category,
           IFNULL(SUM(ti.total), 0) AS revenue
         FROM transaction_items ti
         LEFT JOIN products p ON p.id = ti.product_id
         INNER JOIN transactions t ON t.id = ti.transaction_id
         GROUP BY COALESCE(NULLIF(p.category, ''), 'Uncategorized')
         ORDER BY revenue DESC`,
        (categoryError, categories) => {
          if (categoryError) return res.status(500).json(categoryError);

          const totalsByDate = new Map(
            trendRows.map((row) => [row.sale_date, Number(row.revenue)])
          );
          const trend = Array.from({ length: 7 }, (_, index) => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - (6 - index));
            const dateKey = [
              date.getFullYear(),
              String(date.getMonth() + 1).padStart(2, "0"),
              String(date.getDate()).padStart(2, "0")
            ].join("-");
            return {
              date: dateKey,
              label: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
              revenue: totalsByDate.get(dateKey) || 0
            };
          });

          return res.json({
            trend,
            categories: categories.map((row) => ({ ...row, revenue: Number(row.revenue) }))
          });
        }
      );
    }
  );
};

module.exports = {
  getStats,
  getMonthlySales,
  getTopProducts,
  getAnalytics,
};
