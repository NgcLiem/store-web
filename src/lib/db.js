import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "admin123",
    database: "shoe_shop",
});

// Default export (existing code expecting default)
export default pool;

// Also provide a named export `db` for modules that import { db }
export const db = pool;

