const express = require('express');
const router = express.Router();
const db = require('../server').db;

// 🔹 ดึงรายการสินค้าทั้งหมด
router.get('/', (req, res) => {
  db.query('SELECT * FROM Product', (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

// 🔹 ค้นหาสินค้าตาม ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM Product WHERE ProductID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result[0]);
  });
});

module.exports = router;
