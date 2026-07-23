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
  // The product form currently collects a barcode but not a separate product
  // code. `products.code` is mandatory, so create one server-side instead of
  // passing NULL to MySQL.
  const productCode = String(code || `P-${barcode || Date.now()}`).trim();

  if (!productCode || !String(name || "").trim()) {
    return res.status(400).json({ message: "Product code and name are required." });
  }

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
      productCode,
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
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "A product with this code or barcode already exists." });
        }
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        message: "Product Added Successfully",
        productCode
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
    "SELECT * FROM products WHERE stock <= min_stock",
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

  const normalizedName = String(name || "").trim();
  if (!normalizedName) {
    return res.status(400).json({ message: "Product name is required." });
  }

  db.query(
    `UPDATE products
    SET
      code=? ,
      name=?,
      category=?,
      size=?,
      color=?,
      cost_price=?,
      mrp=?,
      selling_price=?,
      gst_rate=?,
      stock=?,
      min_stock=?,
      barcode=?,
      hsn_code=?,
      brand=?
    WHERE id=?`,
    [
      String(code || "").trim() || `P-${Date.now()}`,
      normalizedName,
      String(category || "").trim() || "General",
      String(size || "").trim() || "M",
      String(color || "").trim() || "Black",
      Number(cost_price ?? 0),
      Number(mrp ?? 0),
      Number(selling_price ?? 0),
      Number(gst_rate ?? 0),
      Number(stock ?? 0),
      Number(min_stock ?? 0),
      String(barcode || "").trim(),
      String(hsn_code || "").trim(),
      String(brand || "").trim() || "Own Brand",
      id
    ],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

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
 
