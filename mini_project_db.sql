CREATE DATABASE IF NOT EXISTS mini_project_db;
USE mini_project_db;

CREATE TABLE Category (
  CategoryID INT PRIMARY KEY AUTO_INCREMENT,
  CategoryName VARCHAR(100) NOT NULL
);

CREATE TABLE Product (
  ProductID INT PRIMARY KEY AUTO_INCREMENT,
  ProductName VARCHAR(100) NOT NULL,
  Description TEXT,
  Price DECIMAL(10,2) NOT NULL CHECK (Price >= 0),
  Stock INT NOT NULL CHECK (Stock >= 0),
  CategoryID INT,
  ImageURL VARCHAR(255),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID) ON DELETE SET NULL
);

CREATE TABLE Customer (
  CustomerID INT PRIMARY KEY AUTO_INCREMENT,
  FullName VARCHAR(100) NOT NULL,
  Email VARCHAR(100) UNIQUE NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Phone VARCHAR(20),
  Address TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Cart (
  CartID INT PRIMARY KEY AUTO_INCREMENT,
  ProductID INT NOT NULL,
  CustomerID INT NOT NULL,
  Quantity INT NOT NULL CHECK (Quantity > 0),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ProductID) REFERENCES Product(ProductID) ON DELETE CASCADE,
  FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE
);

CREATE TABLE Orders (
  OrderID INT PRIMARY KEY AUTO_INCREMENT,
  CustomerID INT NOT NULL,
  OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  TotalPrice DECIMAL(10,2) NOT NULL CHECK (TotalPrice >= 0),
  Status ENUM('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE
);

CREATE TABLE OrderDetail (
  OrderDetailID INT PRIMARY KEY AUTO_INCREMENT,
  OrderID INT NOT NULL,
  ProductID INT NOT NULL,
  Quantity INT NOT NULL CHECK (Quantity > 0),
  Subtotal DECIMAL(10,2) NOT NULL CHECK (Subtotal >= 0),
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
  FOREIGN KEY (ProductID) REFERENCES Product(ProductID) ON DELETE CASCADE
);

CREATE TABLE Payment (
  PaymentID INT PRIMARY KEY AUTO_INCREMENT,
  OrderID INT NOT NULL,
  PaymentMethod ENUM('Credit Card', 'PayPal', 'Bank Transfer') NOT NULL,
  Amount DECIMAL(10,2) NOT NULL CHECK (Amount >= 0),
  PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Status ENUM('Pending', 'Completed', 'Failed') NOT NULL DEFAULT 'Pending',
  FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE
);

CREATE TABLE OrderTracking (
  TrackingID INT PRIMARY KEY AUTO_INCREMENT,
  OrderID INT NOT NULL,
  Status ENUM('Pending', 'Processing', 'Shipped', 'Delivered') NOT NULL DEFAULT 'Pending',
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE
);

CREATE TABLE Review (
  ReviewID INT PRIMARY KEY AUTO_INCREMENT,
  CustomerID INT NOT NULL,
  ProductID INT NOT NULL,
  Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
  Comment TEXT,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE,
  FOREIGN KEY (ProductID) REFERENCES Product(ProductID) ON DELETE CASCADE
);

-- หมวดหมู่สินค้า
INSERT INTO Category (CategoryName) VALUES 
('อุปกรณ์อิเล็กทรอนิกส์'),
('เครื่องใช้ไฟฟ้า'),
('เครื่องสำอาง'),
('เครื่องแต่งกาย'),
('อาหารและเครื่องดื่ม');

-- สินค้า
INSERT INTO Product (ProductName, Description, Price, Stock, CategoryID, ImageURL) VALUES 
('โทรศัพท์มือถือ', 'โทรศัพท์มือถือจอ 6.5 นิ้ว กล้อง 50MP', 12900.00, 50, 1, 'images/phone.jpg'),
('แล็ปท็อป', 'แล็ปท็อปประสิทธิภาพสูงสำหรับงานหนัก', 35900.00, 30, 1, 'images/laptop.jpg'),
('เครื่องซักผ้า', 'เครื่องซักผ้าอัตโนมัติขนาด 8 กก.', 8900.00, 20, 2, 'images/washing_machine.jpg'),
('ลิปสติก', 'ลิปสติกสีแดงสดติดทนนาน', 350.00, 100, 3, 'images/lipstick.jpg'),
('เสื้อยืด', 'เสื้อยืดผ้าฝ้าย 100% สวมใส่สบาย', 199.00, 200, 4, 'images/tshirt.jpg');

-- ลูกค้า
INSERT INTO Customer (FullName, Email, Password, Phone, Address) VALUES 
('สมชาย ใจดี', 'somchai@example.com', 'hashed_password_1', '0812345678', '123 ถนนสุขุมวิท กรุงเทพฯ'),
('สมหญิง สวยงาม', 'somhying@example.com', 'hashed_password_2', '0898765432', '45/6 ถนนรามอินทรา กรุงเทพฯ');

-- ตะกร้าสินค้า
INSERT INTO Cart (ProductID, CustomerID, Quantity) VALUES 
(1, 1, 1),
(3, 2, 2);

-- คำสั่งซื้อ
INSERT INTO Orders (CustomerID, TotalPrice, Status) VALUES 
(1, 12900.00, 'Pending'),
(2, 17800.00, 'Paid');

-- รายละเอียดคำสั่งซื้อ
INSERT INTO OrderDetail (OrderID, ProductID, Quantity, Subtotal) VALUES 
(1, 1, 1, 12900.00),
(2, 3, 2, 17800.00);

-- การชำระเงิน
INSERT INTO Payment (OrderID, PaymentMethod, Amount, Status) VALUES 
(1, 'Credit Card', 12900.00, 'Pending'),
(2, 'Bank Transfer', 17800.00, 'Completed');

-- การติดตามคำสั่งซื้อ
INSERT INTO OrderTracking (OrderID, Status) VALUES 
(1, 'Processing'),
(2, 'Shipped');

-- รีวิวสินค้า
INSERT INTO Review (CustomerID, ProductID, Rating, Comment) VALUES 
(1, 1, 5, 'โทรศัพท์ดีมาก แบตอึด ใช้งานลื่นไหล'),
(2, 3, 4, 'เครื่องซักผ้าใช้งานง่าย ราคาคุ้มค่า');
