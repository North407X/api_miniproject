const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // ใช้ค่าว่างหากเป็น XAMPP
  database: "mini_project_db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Database Connected...");
});

module.exports = db;
