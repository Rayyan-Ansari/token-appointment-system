const http = require('http');

const data = JSON.stringify({
    email: 'admin@tokken.com', // guess based on typical seeds 
    password: 'admin'          // or whatever
});

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/admin/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
}, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const loginResp = JSON.parse(body);
        if (!loginResp.data?.token) {
            console.error("Login failed:", loginResp);
            return;
        }
        const token = loginResp.data.token;
        console.log("Got token.");

        // now fetch tokens
        http.get({
            hostname: 'localhost',
            port: 5000,
            path: '/api/admin/tokens',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        }, (res2) => {
            let body2 = '';
            res2.on('data', d => body2 += d);
            res2.on('end', () => {
                console.log("Tokens response code:", res2.statusCode);
                console.log("Tokens response:", body2);
            });
        });
    });
});
req.write(data);
req.end();
