const http = require('http');

// Step 1: Login customer to get fresh token
console.log('Step 1: Logging in customer...');
const loginBody = JSON.stringify({
    email: 'customer@example.com',
    password: 'customer123',
});

const loginOptions = {
    hostname: 'localhost',
    port: 3003,
    path: '/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginBody.length,
    },
};

let token = null;

const loginReq = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            token = json.access_token;
            console.log('✓ Login successful, token received\n');

            // Step 2: Get orders with new token
            console.log('Step 2: Fetching orders...');
            getOrders(token);
        } catch (e) {
            console.error('Login error:', data);
        }
    });
});

loginReq.on('error', (e) => console.error('Error:', e.message));
loginReq.write(loginBody);
loginReq.end();

// Function to get orders
function getOrders(token) {
    const options = {
        hostname: 'localhost',
        port: 3003,
        path: '/orders',
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + token,
        },
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            try {
                const json = JSON.parse(data);
                console.log('Response:');
                console.log(JSON.stringify(json, null, 2));
                if (Array.isArray(json) && json.length > 0) {
                    console.log(
                        '\n SUCCESS! Customer can see ' +
                            json.length +
                            ' order(s)',
                    );
                    console.log('   Order ID:', json[0].id);
                    console.log('   Status:', json[0].status);
                    console.log('   Amount:', json[0].total_amount);
                } else {
                    console.log('\n❌ FAIL: Empty orders array');
                }
            } catch (e) {
                console.log(data);
            }
        });
    });

    req.on('error', (e) => console.error('Error:', e.message));
    req.end();
}
