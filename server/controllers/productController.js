const db = require("../config/db");

// Add Product
const addProduct = (req, res) => {
  const {
    code,
    name,
    category,
    size,
    color,
    cost_price,
    mrp,
    selling_price,
    gst_rate,
    stock,
    min_stock,
    barcode,
    hsn_code,
    brand
  } = req.body;

  const productId = "prod-" + Date.now();

  const sql = `
    INSERT INTO products
    (
      id,
      code,
      name,
      category,
      size,
      color,
      cost_price,
      mrp,
      selling_price,
      gst_rate,
      stock,
      min_stock,
      barcode,
      hsn_code,
      brand
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      productId,
      code,
      name,
      category,
      size,
      color,
      cost_price,
      mrp,
      selling_price,
      gst_rate,
      stock,
      min_stock,
      barcode,
      hsn_code,
      brand
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Product Added Successfully"
      });
    }
  );
};
const getProducts = (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);
  });
};
const getProductByBarcode = (req, res) => {
  const { barcode } = req.params;

  db.query(
    "SELECT * FROM products WHERE barcode = ?",
    [barcode],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.json(result[0]);
    }
  );
};
const deleteProduct = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM products WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Product Deleted"
      });
    }
  );
};
const getLowStockProducts = (req, res) => {
  db.query(
    "SELECT * FROM products WHERE stock <= 5",
    (err, results) => {
      if (err)
        return res.status(500).json(err);

      res.json(results);
    }
  );
};
const updateProduct = (req, res) => {
  const { id } = req.params;

  const {
  name,
  selling_price,
  stock
} = req.body;

  db.query(
    `UPDATE products
    SET
name=?,
selling_price=?,
stock=?,
category=?,
size=?,
color=?,
brand=?
     WHERE id=?`,
    [
  name,
  selling_price,
  stock,
  "General",
  "M",
  "Black",
  "Own Brand",
  id
],
    (err, result) => {
      if (err)
        return res.status(500).json(err);

      res.json({
        message: "Product Updated"
      });
    }
  );
};


module.exports = {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductByBarcode
};
 