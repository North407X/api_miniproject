const express = require('express');
const router = express.Router();
const db = require('../server').db;

// 🔹 เพิ่มรีวิวสินค้า
router.post('/', (req, res) => {
  const { customerID, productID, rating, comment } = req.body;

  db.query('INSERT INTO Review (CustomerID, ProductID, Rating, Comment, CreatedAt) VALUES (?, ?, ?, ?, NOW())',
    [customerID, productID, rating, comment], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Review added successfully!' });
    });
});

module.exports = router;
