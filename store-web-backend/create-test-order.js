const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'shoe_shop',
    port: 3306,
  });

  try {
    // 1. Create address for user 15
    const [addressResult] = await pool.query(
      `INSERT INTO addresses (user_id, address_line, full_name, phone, is_default) 
       VALUES (?, ?, ?, ?, ?)`,
      [15, '123 Nguyen Hue, Ho Chi Minh City', 'Customer Test', '0901234567', 1]
    );
    console.log('✓ Address created, ID:', addressResult.insertId);

    // 2. Create payment method for user 15
    const [paymentResult] = await pool.query(
      `INSERT INTO payment_methods (user_id, type, brand, status) 
       VALUES (?, ?, ?, ?)`,
      [15, 'BANK', 'Vietcombank', 'ACTIVE']
    );
    console.log('✓ Payment method created, ID:', paymentResult.insertId);

    // 3. Create order for user 15 with checkout
    const [orderResult] = await pool.query(
      `INSERT INTO orders (user_id, address_id, payment_method_id, shipping_address, payment_method, status, order_date, sub_total, discount, shipping_fee, total_amount) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [
        15,                          // user_id
        addressResult.insertId,      // address_id
        paymentResult.insertId,      // payment_method_id
        '123 Nguyen Hue, HCM',       // shipping_address
        'bank_transfer',             // payment_method
        'pending',                   // status
        2500000,                     // sub_total (Nike Air Max 270)
        0,                           // discount
        50000,                       // shipping_fee
        2550000                      // total_amount
      ]
    );
    const orderId = orderResult.insertId;
    console.log('✓ Order created, ID:', orderId);

    // 4. Create order items
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, size, price) 
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, 1, 1, '42', 2500000]  // Nike Air Max 270
    );
    console.log('✓ Order item added (Nike Air Max 270)');

    // 5. Verify
    const [verifyOrders] = await pool.query(
      'SELECT id, user_id, order_date, status, total_amount FROM orders WHERE user_id = 15'
    );
    console.log('\n=== Orders for user 15 after creation ===');
    verifyOrders.forEach(o => {
      console.log(`  ID: ${o.id}, Date: ${o.order_date}, Status: ${o.status}, Amount: ${o.total_amount}`);
    });

    const [verifyItems] = await pool.query(
      `SELECT oi.id, oi.product_id, p.name, oi.quantity, oi.price 
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    console.log('\n=== Items in order ' + orderId + ' ===');
    verifyItems.forEach(i => {
      console.log(`  Product: ${i.name}, Qty: ${i.quantity}, Price: ${i.price}`);
    });

  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
})();
