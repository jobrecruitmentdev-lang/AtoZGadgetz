const http = require('https');
const data = JSON.stringify({ email: 'admin@atozgadgets.com', password: 'admin123' });
const options = {
  hostname: 'atozgadgetz.com',
  port: 443,
  path: '/server-proxy/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': '*/*',
    'Origin': 'https://atozgadgetz.com',
    'Referer': 'https://atozgadgetz.com/login'
  }
};
const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('BODY:', body.substring(0, 500)));
});
req.on('error', error => console.error(error));
req.write(data);
req.end();
