const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "", // ใช้ค่าว่างหากเป็น XAMPP หรือใส่รหัสผ่านถ้ามี
  database: "mini_project_db",
  multipleStatements: true, // อนุญาตให้ใช้หลายคำสั่ง SQL ได้
  charset: "utf8mb4", // รองรับภาษาไทย
});

db.connect((err) => {
  if (err) {
    console.error("Database Connection Failed: " + err.message);
    return;
  }
  console.log("Database Connected...");
});

// ตรวจสอบการเชื่อมต่อใหม่หากมีการตัดการเชื่อมต่อ
db.on("error", (err) => {
  console.error("Database Error: " + err.message);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("Reconnecting to Database...");
    db.connect();
  } else {
    throw err;
  }
});

module.exports = db;
