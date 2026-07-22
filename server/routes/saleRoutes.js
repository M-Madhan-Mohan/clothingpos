const express = require("express");
const router = express.Router();

const {
  saveSale,
  getSales,
  getSaleDetails
} = require("../controllers/saleController");

router.post("/save", saveSale);
router.get("/details/:id", getSaleDetails);
router.get("/", getSales);

module.exports = router;