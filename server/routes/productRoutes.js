const express = require("express");
const router = express.Router();

const {
  addProduct,
  getProducts,
  deleteProduct,
  getProductByBarcode,
  getLowStockProducts,
  updateProduct
} = require("../controllers/productController");

router.post("/add", addProduct);
router.get("/", getProducts);
router.delete("/:id", deleteProduct);
router.get("/barcode/:barcode", getProductByBarcode);
router.put("/:id", updateProduct);
router.get(
  "/low-stock",
  getLowStockProducts
);
module.exports = router;