export const runtime = "nodejs";

let CUSTOMERS = [
    { id: 1, email: "user1@mail.com", full_name: "Nguyễn A", phone: "0901", address: "HCM", active: true },
    { id: 2, email: "user2@mail.com", full_name: "Trần B", phone: "0902", address: "HN", active: false },
];

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get("q") || "").toLowerCase();
        const onlyActive = !!searchParams.get("active");

        let out = CUSTOMERS.filter(c =>
            (!q || (c.email + c.full_name + c.phone).toLowerCase().includes(q)) &&
            (!onlyActive || c.active)
        );

        return Response.json(out, { status: 200 });
    } catch {
        return Response.json({ message: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const body = await req.json();
        // demo: OK
        return Response.json({ ok: true }, { status: 200 });
    } catch {
        return Response.json({ message: "Body không hợp lệ" }, { status: 400 });
    }
}
