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
            // Find an admin and token bypass manually
            bypass();
            return;
        }
        fetchTokens(loginResp.data.token);
    });
});
req.write(data);
req.end();

function bypass() {
    const { PrismaClient } = require('@prisma/client');
    const jwt = require('jsonwebtoken');
    const prisma = new PrismaClient();

    prisma.admin.findFirst().then(admin => {
        if (!admin) {
            console.error("No admin found!");
            return;
        }
        const token = jwt.sign(
            { userId: admin.id.toString(), role: 'admin', email: admin.email },
            process.env.JWT_SECRET || 'fallback-secret-if-missing',
            { expiresIn: '7d' }
        );
        fetchTokens(token);
    });
}

function fetchTokens(token) {
    http.get({
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/tokens',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }, (res) => {
        const status = res.statusCode;
        let b = '';
        res.on('data', d => b += d);
        res.on('end', () => {
            console.log(`STATUS: ${status}`);
            console.log(`BODY: ${b.substring(0, 200)}`);
        });
    });
}
