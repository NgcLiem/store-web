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
    // Check addresses for user 15
    const [addresses] = await pool.query('SELECT id, address_line, is_default FROM addresses WHERE user_id = 15 LIMIT 5');
    console.log('\n=== Addresses for user 15 ===');
    if (addresses.length) {
      addresses.forEach(a => console.log(`  ID: ${a.id}, Address: ${a.address_line}, Default: ${a.is_default}`));
    } else {
      console.log('  No addresses found');
    }

    // Check payment methods for user 15
    const [payments] = await pool.query('SELECT id, brand, type, status FROM payment_methods WHERE user_id = 15 LIMIT 5');
    console.log('\n=== Payment methods for user 15 ===');
    if (payments.length) {
      payments.forEach(p => console.log(`  ID: ${p.id}, Brand: ${p.brand}, Type: ${p.type}, Status: ${p.status}`));
    } else {
      console.log('  No payment methods found');
    }

    // Check existing orders for user 15
    const [orders] = await pool.query('SELECT id, user_id, order_date, status, total_amount FROM orders WHERE user_id = 15 LIMIT 10');
    console.log('\n=== Orders for user 15 ===');
    if (orders.length) {
      orders.forEach(o => console.log(`  ID: ${o.id}, Date: ${o.order_date}, Status: ${o.status}, Amount: ${o.total_amount}`));
    } else {
      console.log('  No orders found');
    }

    // Check products available
    const [products] = await pool.query('SELECT id, name, price FROM products LIMIT 3');
    console.log('\n=== Sample products ===');
    products.forEach(p => console.log(`  ID: ${p.id}, Name: ${p.name}, Price: ${p.price}`));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
})();
