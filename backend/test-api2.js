const http = require('http');

http.get({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/tokens',
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => console.log(`BODY: ${body}`));
}).on('error', console.error);
