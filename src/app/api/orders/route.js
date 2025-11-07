export const runtime = "nodejs";

const MOCK = [
    { id: 101, code: "ORD-101", customer_email: "a@ex.com", total: 1299000, status: "pending" },
    { id: 102, code: "ORD-102", customer_email: "b@ex.com", total: 899000, status: "processing" },
    { id: 103, code: "ORD-103", customer_email: "c@ex.com", total: 1599000, status: "completed" },
];

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get("q") || "").toLowerCase();
        const status = (searchParams.get("status") || "").toLowerCase();

        let out = MOCK.filter(o =>
            !q || o.code.toLowerCase().includes(q) || (o.customer_email || "").toLowerCase().includes(q)
        );
        if (status) out = out.filter(o => o.status === status);

        return Response.json(out, { status: 200 });
    } catch (e) {
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const body = await req.json();
        // tạm thời demo: luôn OK
        return Response.json({ ok: true }, { status: 200 });
    } catch {
        return Response.json({ message: "Body không hợp lệ" }, { status: 400 });
    }
}
