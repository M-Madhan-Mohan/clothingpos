const express = require("express");
const router = express.Router();

const {
  addCustomer,
  getCustomers,
  deleteCustomer
} = require("../controllers/customerController");

router.post("/add", addCustomer);
router.get("/", getCustomers);
router.delete("/:id", deleteCustomer);

module.exports = router;