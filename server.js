const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(bodyParser.json());
// อนุญาตทุกโดเมน (ไม่ปลอดภัยสำหรับ production)
app.use(cors()); 

// หรือกำหนด origin ที่อนุญาตเฉพาะ
app.use(cors({
  origin: "http://localhost:3000", // เปลี่ยนเป็นโดเมนของ frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // กำหนด HTTP methods ที่อนุญาต
  allowedHeaders: ["Content-Type", "Authorization"], // กำหนด headers ที่อนุญาต
}));

const SECRET_KEY = "IT4501"; // ไม่ใช้ .env

// Middleware สำหรับตรวจสอบ JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "❌ No Token Provided" });

  jwt.verify(token.split(" ")[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "❌ Unauthorized" });
    req.CustomerID = decoded.CustomerID;
    next();
  });
};

// ✅ Auth API
// 📌 **1. ลงทะเบียนลูกค้า**
app.post("/api/register", (req, res) => {
  const { fullName, email, password, phone, address} = req.body;
  const hashPassword = bcrypt.hashSync(password, 8);

  db.query("INSERT INTO Customer (FullName, Email, Password, Phone, Address) VALUES (?, ?, ?, ?, ?)", [fullName, email, hashPassword, phone, address], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Customer registered successfully" });
  });
});

// 📌 **2. Login**
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
  }

  db.query("SELECT * FROM Customer WHERE Email = ?", [email], (err, result) => {
      if (err) {
          return res.status(500).json({ message: "Database error", error: err });
      }

      if (result.length === 0) {
          return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = result[0];
      const hashedPassword = user.Password;

      // ตรวจสอบว่ารหัสผ่านถูกต้องหรือไม่
      bcrypt.compare(password, hashedPassword, (err, isMatch) => {
          if (err || !isMatch) {
              return res.status(401).json({ message: "Invalid email or password" });
          }

          // สร้าง JWT Token
          const token = jwt.sign(
              { id: user.CustomerID, email: user.Email },
              SECRET_KEY,
              { expiresIn: "2h" }
          );

          res.json({ message: "Login successful", token });
      });
  });
});

// ✅ Products API
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM Product", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    console.log("Database Response:", results);
    res.json(results); // ต้องแน่ใจว่าเป็น Array
  });
});



app.get("/api/products/:id", (req, res) => {
  db.query("SELECT * FROM Product WHERE ProductID = ?", [req.params.id], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

app.post('/api/cart', (req, res) => {
  const { ProductID, Quantity, UserID } = req.body;
  const query = 'INSERT INTO cart (UserID, ProductID, Quantity) VALUES (?, ?, ?)';
  db.query(query, [UserID, ProductID, Quantity], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error adding product to cart', error: err });
    }
    res.status(200).json({ message: 'Product added to cart', cart_item: result });
  });
});

app.get('/api/cart', (req, res) => {
  const UserID = req.query.UserID; // รับ UserID จาก query string
  const query = 'SELECT * FROM cart WHERE UserID = ?';
  db.query(query, [UserID], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ cart_items: results });
  });
});

app.post('/api/orders', (req, res) => {
  const { CustomerID, TotalPrice, CartItems } = req.body;
  // สร้างคำสั่งซื้อใหม่ในตาราง orders
  const query = 'INSERT INTO orders (CustomerID, TotalPrice) VALUES (?, ?)';
  db.query(query, [CustomerID, TotalPrice], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating order', error: err });
    }
    const OrderID = result.insertId;

    // เพิ่มรายการสินค้าที่สั่งในตาราง order_details
    CartItems.forEach((item) => {
      const orderDetailQuery = 'INSERT INTO order_detail (OrderID, ProductID, Quantity, Subtotal) VALUES (?, ?, ?, ?)';
      db.query(orderDetailQuery, [OrderID, item.ProductID, item.Quantity, item.Subtotal], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error adding order details', error: err });
        }
      });
    });

    res.status(200).json({ message: 'Order created successfully', order_id: OrderID });
  });
});

app.get('/api/orders/:id', (req, res) => {
  const OrderID = req.params.id;
  const query = 'SELECT * FROM orders WHERE OrderID = ?';
  db.query(query, [OrderID], (err, orderResult) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching order', error: err });
    }
    if (orderResult.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const orderDetailsQuery = 'SELECT * FROM orderdetail WHERE OrderID = ?';
    db.query(orderDetailsQuery, [OrderID], (err, orderDetails) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching order details', error: err });
      }
      res.status(200).json({
        order: orderResult[0],
        order_details: orderDetails
      });
    });
  });
});

app.post('/api/payments', (req, res) => {
  const { OrderID, PaymentMethod, Amount } = req.body;
  const query = 'INSERT INTO payment (OrderID, PaymentMethod, Amount) VALUES (?, ?, ?)';
  db.query(query, [OrderID, PaymentMethod, Amount], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error processing payment', error: err });
    }
    res.status(200).json({ message: 'Payment processed successfully', payment_id: result.insertId });
  });
});

app.get('/api/payments/:id', (req, res) => {
  const PaymentID = req.params.id;
  const query = 'SELECT * FROM payment WHERE PaymentID = ?';
  db.query(query, [PaymentID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching payment status', error: err });
    }
    res.status(200).json(result[0]);
  });
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
