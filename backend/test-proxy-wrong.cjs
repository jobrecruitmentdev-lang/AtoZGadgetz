const http = require('https');
const data = JSON.stringify({ email: 'admin@atozgadgets.com', password: 'wrongpassword' });
const options = {
  hostname: 'atozgadgetz.com',
  port: 443,
  path: '/server-proxy/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('BODY:', body));
});
req.on('error', error => console.error(error));
req.write(data);
req.end();
