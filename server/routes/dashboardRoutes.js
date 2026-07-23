const express = require("express");
const router = express.Router();

const {
  getStats,
  getMonthlySales,
  getTopProducts,
  getAnalytics,
} = require("../controllers/dashboardController");

router.get("/", getStats);
router.get("/monthly-sales", getMonthlySales);
router.get("/top-products", getTopProducts);
router.get("/analytics", getAnalytics);

module.exports = router;
