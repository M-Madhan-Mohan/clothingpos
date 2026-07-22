const db = require("../config/db");

const addCustomer = (req, res) => {
  const {
    customer_name,
    phone,
    address
  } = req.body;

  db.query(
    `INSERT INTO customers
    (customer_name, phone, address)
    VALUES (?, ?, ?)`,
    [customer_name, phone, address],
    (err, result) => {
      if (err)
        return res.status(500).json(err);

      res.json({
        message: "Customer Added"
      });
    }
  );
};

const getCustomers = (req, res) => {
  db.query(
    "SELECT * FROM customers",
    (err, results) => {
      if (err)
        return res.status(500).json(err);

      res.json(results);
    }
  );
};
const deleteCustomer = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM customers WHERE id = ?",
    [id],
    (err, result) => {
      if (err)
        return res.status(500).json(err);

      res.json({
        message: "Customer Deleted"
      });
    }
  );
};
module.exports = {
  addCustomer,
  getCustomers,
  deleteCustomer
};