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

      res.status(201).json({
        message: "Customer Added",
        customerId: result.insertId
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

const updateCustomer = (req, res) => {
  const { id } = req.params;
  const { customer_name, phone, address } = req.body;

  db.query(
    `UPDATE customers SET customer_name = ?, phone = ?, address = ? WHERE id = ?`,
    [customer_name, phone, address, id],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Customer Updated" });
    }
  );
};
module.exports = {
  addCustomer,
  getCustomers,
  deleteCustomer,
  updateCustomer
};