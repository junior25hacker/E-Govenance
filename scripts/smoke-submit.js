// Simple smoke test to POST a sample submission to the placeholder backend
// Usage: node scripts/smoke-submit.js
const http = require('http');
const data = JSON.stringify({
  citizenId: 'test-user',
  documentType: 'Test Document',
  councilJurisdiction: 'UnitTest',
  filePath: 'test.pdf',
  requestId: 'REQ-SMOKE-TEST',
  createdAt: new Date().toISOString()
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/documents/submit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
});

req.on('error', (e) => { console.error('Request error', e); });
req.write(data);
req.end();
