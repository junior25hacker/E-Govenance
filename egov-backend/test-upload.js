const fs = require('fs');
const jwt = require('jsonwebtoken');

async function run() {
  const token = jwt.sign({ sub: 1, citizenId: 'TEST-CITIZEN-123' }, 'citizennode-secure-jwt-secret-key-2026', { expiresIn: '1h' });

  // 1. Create a dummy file
  fs.writeFileSync('dummy.pdf', 'dummy pdf content');

  const FormData = require('form-data');
  const form = new FormData();
  form.append('documentType', 'Birth Certificate');
  form.append('fullName', 'John Doe');
  form.append('nationalId', 'NID-123456');
  form.append('file', fs.createReadStream('dummy.pdf'), { filename: 'dummy.pdf', contentType: 'application/pdf' });

  // 2. Upload it
  const uploadRes = await fetch('http://127.0.0.1:3000/api/v1/documents/digitalize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...form.getHeaders()
    },
    body: form
  });

  const uploadJson = await uploadRes.json();
  console.log('Upload response:', uploadJson);

  if (!uploadJson.data || !uploadJson.data.id) {
    console.error('Upload failed!');
    process.exit(1);
  }

  const docId = uploadJson.data.id;

  // 3. Download it
  const downloadRes = await fetch(`http://127.0.0.1:3000/api/v1/documents/${docId}/download`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const text = await downloadRes.text();
  console.log('Download response text:', text);
  if (text === 'dummy pdf content') {
    console.log('Test PASSED!');
  } else {
    console.log('Test FAILED! Content does not match');
  }
}

run().catch(console.error);
