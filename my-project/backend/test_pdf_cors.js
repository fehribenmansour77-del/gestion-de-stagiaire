const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: 1, role: 'admin_rh' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/evaluations/1/pdf',
  method: 'GET',
  headers: {
    'Origin': 'http://localhost:5173',
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  res.on('data', () => {});
});

req.on('error', (e) => {
  console.error('problem with request:', e.message);
});
req.end();
