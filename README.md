# Mini Project: ระบบจัดการร้านค้าออนไลน์

## คำอธิบายโครงการ
โครงการนี้เป็นระบบจัดการร้านค้าออนไลน์ที่มีฟังก์ชันพื้นฐานเกี่ยวกับสินค้า ลูกค้า คำสั่งซื้อ การชำระเงิน และการจัดส่ง โดยพัฒนา API ด้วย Node.js และ Express พร้อมฐานข้อมูล MySQL ที่สามารถใช้งานร่วมกับ phpMyAdmin ได้

## โครงสร้าง API และ Endpoints

### **Products (สินค้า)**
| Method | Endpoint | คำอธิบาย |
|--------|---------|----------|
| GET | `/api/products` | ดึงรายการสินค้าทั้งหมด |
| GET | `/api/products/{id}` | ดึงข้อมูลสินค้ารายตัว |
| POST | `/api/products` | เพิ่มสินค้าใหม่ |
| PUT | `/api/products/{id}` | แก้ไขข้อมูลสินค้า |
| DELETE | `/api/products/{id}` | ลบสินค้า |

### **Customers (ลูกค้า)**
| Method | Endpoint | คำอธิบาย |
|--------|---------|----------|
| GET | `/api/customers` | ดึงข้อมูลลูกค้าทั้งหมด |
| GET | `/api/customers/{id}` | ดึงข้อมูลลูกค้าเฉพาะ ID |
| POST | `/api/customers` | ลงทะเบียนลูกค้าใหม่ |
| PUT | `/api/customers/{id}` | แก้ไขข้อมูลลูกค้า |
| DELETE | `/api/customers/{id}` | ลบลูกค้า |

### **Orders (คำสั่งซื้อ)**
| Method | Endpoint | คำอธิบาย |
|--------|---------|----------|
| GET | `/api/orders` | ดึงคำสั่งซื้อทั้งหมด |
| GET | `/api/orders/{id}` | ดึงรายละเอียดคำสั่งซื้อ |
| POST | `/api/orders` | สร้างคำสั่งซื้อใหม่ |
| PUT | `/api/orders/{id}` | อัปเดตสถานะคำสั่งซื้อ |
| DELETE | `/api/orders/{id}` | ยกเลิกคำสั่งซื้อ |

### **Payments (การชำระเงิน)**
| Method | Endpoint | คำอธิบาย |
|--------|---------|----------|
| GET | `/api/payments` | ดึงข้อมูลการชำระเงินทั้งหมด |
| GET | `/api/payments/{id}` | ดึงข้อมูลการชำระเงินเฉพาะ ID |
| POST | `/api/payments` | บันทึกการชำระเงิน |
| PUT | `/api/payments/{id}` | อัปเดตสถานะการชำระเงิน |

### **Shipping (การจัดส่งสินค้า)**
| Method | Endpoint | คำอธิบาย |
|--------|---------|----------|
| GET | `/api/shipping` | ดึงข้อมูลการจัดส่งทั้งหมด |
| GET | `/api/shipping/{id}` | ดึงข้อมูลการจัดส่งเฉพาะ ID |
| POST | `/api/shipping` | เพิ่มข้อมูลการจัดส่งใหม่ |
| PUT | `/api/shipping/{id}` | อัปเดตสถานะการจัดส่ง |

## วิธีติดตั้งและใช้งาน API
### **1. ดาวน์โหลดโปรเจคจาก GitHub**
```sh
git clone <repository_url>
cd <project_folder>
```

### **2. ติดตั้ง Dependencies**
```sh
npm install
```

### **3. ตั้งค่าฐานข้อมูล MySQL ใน phpMyAdmin**
- สร้างฐานข้อมูล `mini_project_db`
- นำเข้าไฟล์ `mini_project_db.sql` ผ่าน phpMyAdmin

### **4. เริ่มต้นเซิร์ฟเวอร์**
```sh
node server.js
```

### **5. ทดสอบ API ด้วย Postman หรือ Browser**

- ตรวจสอบรายการสินค้าทั้งหมด: `http://localhost:5000/api/products`
- ตรวจสอบข้อมูลลูกค้า: `http://localhost:5000/api/customers`
- ตรวจสอบคำสั่งซื้อ: `http://localhost:5000/api/orders`

## **เทคโนโลยีที่ใช้**
- Node.js + Express.js
- MySQL + phpMyAdmin
- Bootstrap + React (สำหรับ Frontend)

## **ผู้พัฒนา**
- ชื่อผู้พัฒนา: (ใส่ชื่อของคุณ)
- ติดต่อ: (ใส่อีเมลหรือช่องทางการติดต่อ)

---
**หมายเหตุ:** โครงการนี้สามารถต่อยอดเพื่อพัฒนาเป็นระบบร้านค้าออนไลน์ที่สมบูรณ์ขึ้นได้ เช่น เพิ่มระบบแอดมิน, ระบบแจ้งเตือนผ่านอีเมล, หรือรองรับการชำระเงินผ่านช่องทางต่างๆ