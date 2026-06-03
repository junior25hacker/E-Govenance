const http = require('http');

function makeRequest(path, method, body, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (cookies) {
      options.headers['Cookie'] = cookies;
    }

    const req = http.request(options, (res) => {
      let data = '';
      let setCookies = res.headers['set-cookie'];
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ 
            data: JSON.parse(data),
            setCookies: setCookies 
          });
        } catch (e) {
          resolve({ 
            data: data,
            setCookies: setCookies 
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

(async () => {
  try {
    console.log('=== REGISTER ===');
    const reg = await makeRequest('/api/v1/auth/citizen/register', 'POST', { 
      email: 'testuser4@nest.com', 
      password: 'password123' 
    });
    console.log(JSON.stringify(reg.data, null, 2));
    let cookies = reg.setCookies ? reg.setCookies[0].split(';')[0] : '';
    const citizenId = reg.data.citizenId;

    console.log('\n=== LOGIN ===');
    const login = await makeRequest('/api/v1/auth/citizen/login', 'POST', { 
      citizenId, 
      password: 'password123' 
    }, cookies);
    console.log(JSON.stringify(login.data, null, 2));
    if (login.setCookies) {
      cookies = login.setCookies[0].split(';')[0];
    }

    console.log('\n=== SUBMIT REQUEST ===');
    const req = await makeRequest('/api/v1/documents/submit', 'POST', { 
      documentType: 'Birth Certificate',
      fullName: 'Test User',
      nationalId: '202401999',
      email: 'testuser4@nest.com',
      phone: '0712345678',
      purpose: 'Application'
    }, cookies);
    console.log(JSON.stringify(req.data, null, 2));

    console.log('\n=== SUBMIT REPORT ===');
    const rpt = await makeRequest('/api/v1/documents/report', 'POST', { 
      category: 'Road Maintenance',
      priority: 'HIGH',
      location: 'Main St',
      description: 'Pothole',
      phone: '0712345678'
    }, cookies);
    console.log(JSON.stringify(rpt.data, null, 2));

    console.log('\n=== GET REQUESTS ===');
    const requests = await makeRequest('/api/v1/documents/requests', 'GET', null, cookies);
    console.log(JSON.stringify(requests.data, null, 2));

    console.log('\n=== GET REPORTS ===');
    const reports = await makeRequest('/api/v1/documents/reports', 'GET', null, cookies);
    console.log(JSON.stringify(reports.data, null, 2));

    console.log('\n=== GET SETTINGS PROFILE ===');
    const settingsProfile = await makeRequest('/api/v1/settings/profile', 'GET', null, cookies);
    console.log(JSON.stringify(settingsProfile.data, null, 2));

    console.log('\n=== UPDATE PROFILE ===');
    const updatedProfile = await makeRequest('/api/v1/settings/profile', 'PUT', {
      fullName: 'Updated Test User',
      phone: '+2348123456789',
      nationalId: 'NG-202401999'
    }, cookies);
    console.log(JSON.stringify(updatedProfile.data, null, 2));

    console.log('\n=== UPDATE PREFERENCES ===');
    const prefs = await makeRequest('/api/v1/settings/preferences', 'PUT', {
      emailNotifications: false,
      smsNotifications: true,
      publicProfile: true,
      shareWithAgencies: false,
      twoFactorAuth: false
    }, cookies);
    console.log(JSON.stringify(prefs.data, null, 2));

    console.log('\n=== EXPORT DATA (JSON) ===');
    const exportedData = await makeRequest('/api/v1/settings/export?format=json', 'GET', null, cookies);
    console.log(JSON.stringify(exportedData.data, null, 2));

  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
