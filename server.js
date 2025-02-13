const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(bodyParser.json());
app.use(cors());

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
  const { fullName, email, password } = req.body;
  const hashPassword = bcrypt.hashSync(password, 8);

  db.query("INSERT INTO Customer (FullName, Email, Password) VALUES (?, ?, ?)", [fullName, email, hashPassword], (err, result) => {
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
  db.query("SELECT * FROM Product", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.get("/api/products/:id", (req, res) => {
  db.query("SELECT * FROM Product WHERE ProductID = ?", [req.params.id], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

app.post("/api/products", verifyToken, (req, res) => {
  const { ProductName, Price, Stock } = req.body;
  db.query("INSERT INTO Product (ProductName, Price, Stock) VALUES (?, ?, ?)", [ProductName, Price, Stock], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Product Added" });
  });
});

app.put("/api/products/:id", verifyToken, (req, res) => {
  const { ProductName, Price, Stock } = req.body;
  db.query("UPDATE Product SET ProductName=?, Price=?, Stock=? WHERE ProductID=?", 
  [ProductName, Price, Stock, req.params.id], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Product Updated" });
  });
});

app.delete("/api/products/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM Product WHERE ProductID = ?", [req.params.id], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Product Deleted" });
  });
});

// ✅ Orders API
app.get("/api/orders", verifyToken, (req, res) => {
  db.query("SELECT * FROM `Order` WHERE CustomerID = ?", [req.CustomerID], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.post("/api/orders", verifyToken, (req, res) => {
  const { OrderDate } = req.body;
  db.query("INSERT INTO `Order` (OrderDate, CustomerID) VALUES (?, ?)", [OrderDate, req.CustomerID], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Order Created" });
  });
});

app.put("/api/orders/:id", verifyToken, (req, res) => {
  const { Status } = req.body;
  db.query("UPDATE `Order` SET Status = ? WHERE OrderID = ?", [Status, req.params.id], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Order Updated" });
  });
});

app.delete("/api/orders/:id", verifyToken, (req, res) => {
  db.query("DELETE FROM `Order` WHERE OrderID = ?", [req.params.id], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Order Cancelled" });
  });
});

// ✅ Payments API
app.get("/api/payments", verifyToken, (req, res) => {
  db.query("SELECT * FROM Payment", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.post("/api/payments", verifyToken, (req, res) => {
  const { OrderID, Amount } = req.body;
  db.query("INSERT INTO Payment (OrderID, Amount) VALUES (?, ?)", [OrderID, Amount], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Payment Recorded" });
  });
});

// ✅ Shipping API
app.get("/api/shipping", verifyToken, (req, res) => {
  db.query("SELECT * FROM Shipping", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.post("/api/shipping", verifyToken, (req, res) => {
  const { OrderID, Status } = req.body;
  db.query("INSERT INTO Shipping (OrderID, Status) VALUES (?, ?)", [OrderID, Status], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Shipping Created" });
  });
});

app.put("/api/shipping/:id", verifyToken, (req, res) => {
  const { Status } = req.body;
  db.query("UPDATE Shipping SET Status = ? WHERE ShippingID = ?", [Status, req.params.id], (err) => {
    if (err) throw err;
    res.json({ message: "✅ Shipping Updated" });
  });
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
