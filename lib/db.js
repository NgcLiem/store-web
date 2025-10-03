import mysql from "mysql2/promise";

// Tạo pool để tái sử dụng kết nối
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "donidg_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;
