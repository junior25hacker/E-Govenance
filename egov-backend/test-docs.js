const http = require('http');
http.get('http://localhost:3000/api/v1/documents?citizenId=CITIZEN_123', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});
