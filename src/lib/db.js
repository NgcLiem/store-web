import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "shoe_shop",
});

export default pool;

