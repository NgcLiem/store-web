export const runtime = "nodejs";
import pool from "@/lib/db.js";

export async function GET() {
    try {
        const [[{ orders }]] = await pool.query(`SELECT COUNT(*) AS orders FROM orders`);
        const [[{ revenue }]] = await pool.query(`SELECT COALESCE(SUM(total_amount),0) AS revenue FROM orders WHERE status='delivered'`);
        const [[{ customers }]] = await pool.query(`SELECT COUNT(*) AS customers FROM users WHERE role='customer'`);
        const [[{ products }]] = await pool.query(`SELECT COUNT(*) AS products FROM products`);

        return Response.json({ orders, revenue, customers, products }, { status: 200 });
    } catch (e) {
        console.error("STAT GET:", e);
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}
