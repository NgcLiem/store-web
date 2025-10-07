import mysql from "mysql2/promise";

// Kết nối đến database MySQL
const pool = mysql.createPool({
    host: "localhost",      // hoặc 127.0.0.1
    user: "root",           // tên user MySQL của bạn
    password: "123456",           // mật khẩu MySQL
    database: "shoe_shop",  // tên database bạn vừa tạo
});

export default pool;

