const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with admin user...');
    console.log('Request URL: http://localhost:5003/api/auth/login');
    console.log('Request data:', {
      email: 'admin@psc.com',
      password: 'password123'
    });

    const response = await axios.post('http://localhost:5003/api/auth/login', {
      email: 'admin@psc.com',
      password: 'password123'
    });

    console.log('Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Login failed!');
    console.error('Error status:', error.response ? error.response.status : 'No status');
    console.error('Error data:', error.response ? error.response.data : 'No response data');
    console.error('Error message:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
  }
}

testLogin();
