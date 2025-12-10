import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'admin123',
    database: 'shoe_shop',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            user_id,
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            payment_method,
            notes,
            total_amount,
            items
        } = body;

        // Validate
        if (!customer_name || !customer_email || !customer_phone || !shipping_address || !items || items.length === 0) {
            return Response.json({ error: true, message: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Insert order
            const [orderResult] = await connection.execute(
                `INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, shipping_address, payment_method, notes, total_amount, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                [user_id || null, customer_name, customer_email, customer_phone, shipping_address, payment_method, notes || '', total_amount]
            );

            const orderId = orderResult.insertId;

            // Insert order items
            for (const item of items) {
                await connection.execute(
                    `INSERT INTO order_items (order_id, product_id, quantity, price, size)
                    VALUES (?, ?, ?, ?, ?)`,
                    [orderId, item.product_id, item.quantity, item.price, item.size || null]
                );
            }

            await connection.commit();

            return Response.json({ success: true, order_id: orderId }, { status: 201 });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Create order error:', error);
        return Response.json({ error: true, message: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        const orderId = searchParams.get('order_id');
        const status = searchParams.get('status');

        let query = `
            SELECT o.*, 
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'product_id', oi.product_id,
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'size', oi.size,
                        'product_name', p.name,
                        'product_image', p.image_url
                    )
                ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
        `;

        const conditions = [];
        const params = [];

        if (orderId) {
            conditions.push('o.id = ?');
            params.push(orderId);
        }

        if (userId) {
            conditions.push('o.user_id = ?');
            params.push(userId);
        }

        if (status) {
            conditions.push('o.status = ?');
            params.push(status);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY o.id ORDER BY o.created_at DESC';

        const [rows] = await pool.execute(query, params);

        // Parse items JSON
        const orders = rows.map(order => ({
            ...order,
            items: order.items ? JSON.parse(`[${order.items}]`) : []
        }));

        // If only one order requested by ID, return single object
        if (orderId && orders.length === 1) {
            return Response.json(orders[0], { status: 200 });
        }

        // Otherwise return array wrapped in object
        return Response.json({ success: true, orders }, { status: 200 });

    } catch (error) {
        console.error('Get orders error:', error);
        return Response.json({ error: true, message: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { order_id, status } = body;

        if (!order_id || !status) {
            return Response.json({ error: true, message: 'Thiếu order_id hoặc status' }, { status: 400 });
        }

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return Response.json({ error: true, message: 'Trạng thái không hợp lệ' }, { status: 400 });
        }

        await pool.execute(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, order_id]
        );

        return Response.json({ success: true, message: 'Cập nhật trạng thái thành công' }, { status: 200 });

    } catch (error) {
        console.error('Update order status error:', error);
        return Response.json({ error: true, message: error.message }, { status: 500 });
    }
}
