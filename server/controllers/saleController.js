const db = require("../config/db");

const saveSale = (req, res) => {
  const {
    total,
    cart,
    customerName,
    customerMobile,
    paymentMode = "Cash"
  } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: "A sale must include at least one item." });
  }

  const grandTotal = Number(total);
  if (!Number.isFinite(grandTotal) || grandTotal < 0) {
    return res.status(400).json({ message: "A valid grand total is required." });
  }

  const itemSubtotal = cart.reduce((sum, item) => {
    const quantity = Number(item.quantity ?? item.qty);
    const price = Number(item.selling_price ?? item.price);

    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price < 0) {
      return NaN;
    }

    return sum + quantity * price;
  }, 0);

  if (!Number.isFinite(itemSubtotal)) {
    return res.status(400).json({ message: "Each item must have a valid quantity and price." });
  }

  // The current POS submits the post-tax total only. Its checkout calculation uses
  // a 12% GST rate, so derive the persisted subtotal, GST and discount snapshots
  // from that final amount without requiring any client-side changes.
  const taxableSubtotal = Math.min(itemSubtotal, grandTotal / 1.12);
  const discountAmount = Number((itemSubtotal - taxableSubtotal).toFixed(2));
  const gstAmount = Number((grandTotal - taxableSubtotal).toFixed(2));
  const subtotal = Number(itemSubtotal.toFixed(2));
  const transactionId = "txn-" + Date.now();

  db.beginTransaction((transactionError) => {
    if (transactionError) {
      return res.status(500).json(transactionError);
    }

  db.query(
    `
    INSERT INTO transactions
    (
      id,
      date,
      subtotal,
      gst_amount,
      discount_amount,
      grand_total,
      payment_mode,
      customer_name,
      customer_mobile
    )
    VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      transactionId,
      subtotal,
      gstAmount,
      discountAmount,
      grandTotal,
      paymentMode,
      customerName || "Walk-in Customer",
      customerMobile || ""
    ],
    (err) => {
      if (err) {
        return db.rollback(() => res.status(500).json(err));
      }

      let completedQueries = 0;
      let settled = false;
      const expectedQueries = cart.length * 2;
      const finish = (queryError) => {
        if (settled) return;

        if (queryError) {
          settled = true;
          return db.rollback(() => res.status(500).json(queryError));
        }

        completedQueries += 1;
        if (completedQueries !== expectedQueries) return;

        settled = true;
        db.commit((commitError) => {
          if (commitError) {
            return db.rollback(() => res.status(500).json(commitError));
          }

          return res.status(201).json({
            success: true,
            transactionId,
            invoiceId: `INV-${transactionId.slice(-6)}`
          });
        });
      };

      cart.forEach((item) => {
        const quantity = Number(item.quantity ?? item.qty);
        const price = Number(item.selling_price ?? item.price);
        const itemTotal = quantity * price;

        db.query(
          `
          INSERT INTO transaction_items
          (
            transaction_id,
            product_id,
            name,
            size,
            color,
            qty,
            price,
            gst_rate,
            total
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            transactionId,
            item.id,
            item.name,
            item.size || "",
            item.color || "",
            quantity,
            price,
            item.gst_rate || 0,
            itemTotal
          ],
          finish
        );

        db.query(
          `
          UPDATE products
          SET stock = stock - ?
          WHERE id = ? AND stock >= ?
          `,
          [quantity, item.id, quantity],
          (stockError, stockResult) => {
            if (stockError) return finish(stockError);
            if (stockResult.affectedRows !== 1) {
              return finish({ message: `Insufficient stock for product ${item.id}.` });
            }
            return finish();
          }
        );
      });
    }
  );
  });
};

const getSales = (req, res) => {
  const search = String(req.query.search || req.query.q || "").trim();
  const searchTerm = `%${search}%`;
  const filters = search
    ? `WHERE CONCAT('INV-', RIGHT(t.id, 6)) LIKE ?
       OR t.id LIKE ?
       OR t.customer_name LIKE ?
       OR t.customer_mobile LIKE ?
       OR t.payment_mode LIKE ?`
    : "";
  const values = search
    ? [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    : [];

  db.query(
    `
    SELECT
      t.id,
      CONCAT('INV-', RIGHT(t.id, 6)) AS invoice_id,
      t.date,
      t.subtotal,
      t.gst_amount,
      t.discount_amount,
      t.grand_total,
      t.customer_name,
      t.customer_mobile,
      t.payment_mode
    FROM transactions t
    ${filters}
    ORDER BY t.date DESC, t.id DESC
    `,
    values,
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.json(results);
    }
  );
};

const getSaleDetails = (req, res) => {
  const { id } = req.params;

  db.query(
    `
    SELECT
      t.id,
      t.date,
      t.customer_name,
      t.customer_mobile,
      t.subtotal,
      t.gst_amount,
      t.discount_amount,
      t.grand_total,
      t.payment_mode,
      ti.name,
      ti.size,
      ti.color,
      ti.qty,
      ti.price,
      ti.gst_rate,
      ti.total
    FROM transactions t
    JOIN transaction_items ti
      ON t.id = ti.transaction_id
    WHERE t.id = ?
    `,
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
};

module.exports = {
  saveSale,
  getSales,
  getSaleDetails
};
