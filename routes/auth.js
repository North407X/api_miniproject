const express = require('express');
const router = express.Router();
const db = require('../server').db;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// 🔹 Register
router.post('/register', async (req, res) => {
  const { fullName, email, password, phone, address } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO Customer (FullName, Email, Password, Phone, Address, CreatedAt)
               VALUES (?, ?, ?, ?, ?, NOW())`;
  db.query(sql, [fullName, email, hashedPassword, phone, address], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'User registered successfully!' });
  });
});

// 🔹 Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  db.query('SELECT * FROM Customer WHERE Email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    const validPass = await bcrypt.compare(password, user.Password);
    if (!validPass) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userID: user.CustomerID }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.CustomerID, fullName: user.FullName, email: user.Email } });
  });
});

module.exports = router;
