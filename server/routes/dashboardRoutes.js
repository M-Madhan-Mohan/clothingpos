const express = require("express");
const router = express.Router();

const {
  getStats,
  getMonthlySales,
  getTopProducts,
} = require("../controllers/dashboardController");

router.get("/", getStats);
router.get("/monthly-sales", getMonthlySales);
router.get("/top-products", getTopProducts);

module.exports = router;