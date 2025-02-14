const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./database");

const app = express();
app.use(bodyParser.json());

// หรือกำหนด origin ที่อนุญาตเฉพาะ
app.use(cors({
  origin: "http://localhost:3000", // เปลี่ยนเป็นโดเมนของ frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // กำหนด HTTP methods ที่อนุญาต
  allowedHeaders: ["Content-Type", "Authorization"], // กำหนด headers ที่อนุญาต
}));

const SECRET_KEY = "IT_lannapoly_cnx"; // ไม่ใช้ .env

// Middleware สำหรับตรวจสอบ JWT Token
const authenticate = (req, res, next) => {
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

// GET all products
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM Product';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.json({ products: results });
  });
});

// GET product by ID
app.get('/api/products/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Product WHERE ProductID = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(results[0]);
  });
});

// POST - Add new product
app.post('/api/products', authenticate, (req, res) => {
  const { ProductName, Description, Price, Stock, CategoryID, ImageURL } = req.body;
  const query = 'INSERT INTO Product (ProductName, Description, Price, Stock, CategoryID, ImageURL) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [ProductName, Description, Price, Stock, CategoryID, ImageURL], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.json({ status: 'success', message: 'Product added successfully' });
  });
});

// PUT - Update product by ID
app.put('/api/products/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { ProductName, Price, Stock } = req.body;
  const query = 'UPDATE Product SET ProductName = ?, Price = ?, Stock = ? WHERE ProductID = ?';
  db.query(query, [ProductName, Price, Stock, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
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
    res.json({ status: 'success', message: 'Product updated successfully' });
  });
});

// DELETE - Remove product by ID
app.delete('/api/products/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Product WHERE ProductID = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ status: 'success', message: 'Product deleted successfully' });
  });
});

// ==================== Cart API ====================

// 1. GET - ดึงข้อมูลตะกร้าสินค้าของลูกค้า
app.get('/api/cart/:customerId', authenticate, (req, res) => {
  const { customerId } = req.params;
  const query = `
    SELECT c.CartID, c.ProductID, c.Quantity, p.ProductName, p.Price 
    FROM Cart c 
    JOIN Product p ON c.ProductID = p.ProductID 
    WHERE c.CustomerID = ?`;
  
  db.query(query, [customerId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.json({ cartItems: results });
  });
});

// 2. POST - เพิ่มสินค้าไปยังตะกร้า
app.post('/api/cart', authenticate, (req, res) => {
  const { ProductID, Quantity, CustomerID } = req.body;
  
  // ตรวจสอบว่ามีสินค้าอยู่ในตะกร้าแล้วหรือไม่
  const checkQuery = 'SELECT * FROM Cart WHERE CustomerID = ? AND ProductID = ?';
  db.query(checkQuery, [CustomerID, ProductID], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (result.length > 0) {
      // อัปเดตจำนวนสินค้าแทน
      const updateQuery = 'UPDATE Cart SET Quantity = Quantity + ? WHERE CustomerID = ? AND ProductID = ?';
      db.query(updateQuery, [Quantity, CustomerID, ProductID], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ message: 'Database error', error: updateErr });
        }
        return res.json({ status: 'success', message: 'Product quantity updated in cart' });
      });
    } else {
      // เพิ่มสินค้าใหม่ลงตะกร้า
      const insertQuery = 'INSERT INTO Cart (CustomerID, ProductID, Quantity) VALUES (?, ?, ?)';
      db.query(insertQuery, [CustomerID, ProductID, Quantity], (insertErr) => {
        if (insertErr) {
          return res.status(500).json({ message: 'Database error', error: insertErr });
        }
        res.json({ status: 'success', message: 'Product added to cart successfully' });
      });
    }
  });
});

// 3. PUT - แก้ไขจำนวนสินค้าในตะกร้า
app.put('/api/cart/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { Quantity } = req.body;

  if (Quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  const query = 'UPDATE Cart SET Quantity = ? WHERE CartID = ?';
  db.query(query, [Quantity, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.json({ status: 'success', message: 'Cart item updated successfully' });
  });
});

// 4. DELETE - ลบสินค้าจากตะกร้า
app.delete('/api/cart/:id', authenticate, (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM Cart WHERE CartID = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.json({ status: 'success', message: 'Cart item deleted successfully' });
  });
});

// Get all orders by customerId
app.get('/api/orders/:customerId', authenticate, (req, res) => {
  const { customerId } = req.params;
  db.query('SELECT * FROM Orders WHERE CustomerID = ?', [customerId], (err, results) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });
      res.json({ orders: results });
  });
});

// Get order by ID
app.get('/api/orders/order/:id', authenticate, (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM Orders WHERE OrderID = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });
      if (results.length === 0) return res.status(404).json({ status: 'error', message: 'Order not found' });
      res.json(results[0]);
  });
});

// Create a new order
app.post('/api/orders', authenticate, (req, res) => {
  const { CustomerID, TotalPrice, Status } = req.body;
  if (!CustomerID || !TotalPrice || !Status) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }
  db.query('INSERT INTO Orders (CustomerID, TotalPrice, Status) VALUES (?, ?, ?)',
      [CustomerID, TotalPrice, Status],
      (err, result) => {
          if (err) return res.status(500).json({ status: 'error', message: err.message });
          res.json({ status: 'success', message: 'Order created successfully', OrderID: result.insertId });
      });
});

// Update order status
app.put('/api/orders/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;
  if (!Status) {
      return res.status(400).json({ status: 'error', message: 'Status is required' });
  }
  db.query('UPDATE Orders SET Status = ? WHERE OrderID = ?', [Status, id], (err) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });
      res.json({ status: 'success', message: 'Order updated successfully' });
  });
});

// Delete an order
app.delete('/api/orders/:id', authenticate, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM Orders WHERE OrderID = ?', [id], (err) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });
      res.json({ status: 'success', message: 'Order deleted successfully' });
  });
});

// GET payment by order ID
app.get("/api/payments/:orderId", authenticate, (req, res) => {
  const { orderId } = req.params;
  db.query("SELECT * FROM payment WHERE OrderID = ?", [orderId], (err, result) => {
    if (err) throw err;
    res.json(result[0] || {});
  });
});

// POST create new payment
app.post("/api/payments", authenticate, (req, res) => {
  const { OrderID, PaymentMethod, Amount } = req.body;
  db.query(
    "INSERT INTO payment (OrderID, PaymentMethod, Amount, Status) VALUES (?, ?, ?, 'Pending')",
    [OrderID, PaymentMethod, Amount],
    (err, result) => {
      if (err) throw err;
      res.json({ status: "success", message: "Payment created successfully" });
    }
  );
});

// PUT update payment status
app.put("/api/payments/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;
  db.query("UPDATE payment SET Status = ? WHERE PaymentID = ?", [Status, id], (err) => {
    if (err) throw err;
    res.json({ status: "success", message: "Payment status updated successfully" });
  });
});

// DELETE payment record
app.delete("/api/payments/:id", authenticate, (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM payment WHERE PaymentID = ?", [id], (err) => {
    if (err) throw err;
    res.json({ status: "success", message: "Payment deleted successfully" });
  });
});

// 🔹 GET: ดึงข้อมูลการติดตามคำสั่งซื้อ
app.get("/api/order-tracking/:orderId", (req, res) => {
  const { orderId } = req.params;
  const sql = "SELECT * FROM ordertracking WHERE OrderID = ?";
  db.query(sql, [orderId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(404).json({ message: "Tracking data not found" });
      res.json(result[0]);
  });
});

// 🔹 PUT: อัปเดตสถานะการติดตามคำสั่งซื้อ
app.put("/api/order-tracking/:id", (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;
  const sql = "UPDATE ordertracking SET Status = ? WHERE TrackingID = ?";
  db.query(sql, [Status, id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: "Tracking data not found" });
      res.json({ status: "success", message: "Order tracking updated successfully" });
  });
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
