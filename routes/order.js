const express = require('express');
const router = express.Router();
const db = require('../server').db;

// 🔹 สร้างคำสั่งซื้อใหม่
router.post('/', (req, res) => {
  const { customerID, totalPrice, products } = req.body;

  db.query('INSERT INTO Orders (CustomerID, OrderDate, TotalPrice, Status) VALUES (?, NOW(), ?, "Pending")',
    [customerID, totalPrice], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      const orderID = result.insertId;
      products.forEach(product => {
        db.query('INSERT INTO OrderDetail (OrderID, ProductID, Quantity, Subtotal) VALUES (?, ?, ?, ?)',
          [orderID, product.productID, product.quantity, product.quantity * product.price]);
      });

      res.json({ message: 'Order created!', orderID });
    });
});

// 🔹 ดึงคำสั่งซื้อของลูกค้า
router.get('/:customerID', (req, res) => {
  db.query('SELECT * FROM Orders WHERE CustomerID = ?', [req.params.customerID], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

module.exports = router;
