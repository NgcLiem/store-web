import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "admin123",
    database: "shoe_shop",
});

export default pool;

