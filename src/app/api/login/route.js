// import bcrypt from "bcryptjs";
// import pool from "@/lib/db.js";

// export async function POST(req) {
//     try {
//         const { email, password } = await req.json();
//         if (!email || !password)
//             return new Response(JSON.stringify({ message: "Sai thông tin đăng nhập" }), { status: 500 });

//         const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

//         if (result.length === 0)
//             return new Response(JSON.stringify({ message: "Email không tồn tại!" }), { status: 500 });

//         const user = result[0];
//         const match = await bcrypt.compare(password, user.password);

//         if (!match)
//             return new Response(JSON.stringify({ message: "Mật khẩu sai" }), { status: 500 });

//         return new Response(JSON.stringify({
//             user: {
//                 id: user.id,
//                 email: user.email,
//                 role: user.role,
//             },
//         }),
//             { status: 200 });
//     } catch (error) {
//         console.error("Login error:", error);
//         return new Response(JSON.stringify({ message: "Lỗi server!" }), { status: 500 });
//     }
// }

// src/app/api/login/route.js
export const runtime = "nodejs";
import bcrypt from "bcryptjs";
import pool from "@/lib/db.js";

export async function POST(req) {
    try {
        let body;
        try { body = await req.json(); }
        catch { return Response.json({ message: "Body không hợp lệ" }, { status: 400 }); }

        const { email, password } = body || {};
        if (!email || !password) {
            return Response.json({ message: "Thiếu email hoặc mật khẩu" }, { status: 400 });
        }

        const [rows] = await pool.query(
            "SELECT id, email, role, password FROM users WHERE email = ?",
            [email]
        );
        if (!rows?.length) {
            return Response.json({ message: "Email không tồn tại" }, { status: 404 });
        }

        const user = rows[0];

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return Response.json({ message: "Mật khẩu sai" }, { status: 401 });
        }

        return Response.json(
            { user: { id: user.id, email: user.email, role: user.role } },
            { status: 200 }
        );
    } catch (err) {
        console.error("Login error:", err.code || err.message, err);
        let msg = "Lỗi server!";
        if (err?.code === "ECONNREFUSED") msg = "Không kết nối được DB";
        if (err?.code === "ER_NO_SUCH_TABLE") msg = "Thiếu bảng users trong DB";
        return Response.json({ message: msg, code: err?.code }, { status: 500 });
    }
}

