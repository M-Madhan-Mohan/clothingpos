const express = require("express");
const router = express.Router();

const {
  addExpense,
  getExpenses,
  markExpensePaid
} = require("../controllers/expenseController");

router.post("/add", addExpense);
router.get("/", getExpenses);
router.patch("/:id/pay", markExpensePaid);

module.exports = router;
