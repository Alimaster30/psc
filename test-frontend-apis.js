// Test frontend API endpoints to identify issues
const axios = require('axios');

const BASE_URL = 'https://prime-skin-clinic-api.onrender.com/api';

// Test login first to get token
async function testLogin() {
  try {
    console.log('🔐 Testing admin login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@psc.com',
      password: 'Admin123!'
    });

    console.log('Login response:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('✅ Login successful');
      // Check different possible token locations
      const token = response.data.token || response.data.data?.token || response.data.data?.accessToken;
      console.log('Token found:', token ? 'Yes' : 'No');
      return token;
    } else {
      console.log('❌ Login failed:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    return null;
  }
}

// Test API endpoints that are failing in frontend
async function testEndpoints() {
  const token = await testLogin();
  if (!token) {
    console.log('Cannot proceed without token');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Test endpoints that are showing "Failed to load" errors
  const endpoints = [
    { name: 'Patients', url: '/patients' },
    { name: 'Users (Doctors)', url: '/users?role=dermatologist' },
    { name: 'Services', url: '/services' },
    { name: 'All Users', url: '/users' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint.name}...`);
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, { headers });

      if (response.data.success) {
        console.log(`✅ ${endpoint.name} - Success`);
        console.log(`   Data count: ${response.data.data?.length || 'N/A'}`);
        if (response.data.data?.length > 0) {
          console.log(`   Sample: ${JSON.stringify(response.data.data[0], null, 2).substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ ${endpoint.name} - Failed:`, response.data);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} - Error:`, error.response?.data || error.message);
    }
  }

  // Test appointment creation with sample data
  console.log('\n📝 Testing appointment creation...');
  try {
    // First get a patient and doctor
    const patientsResponse = await axios.get(`${BASE_URL}/patients`, { headers });
    const usersResponse = await axios.get(`${BASE_URL}/users?role=dermatologist`, { headers });
    const servicesResponse = await axios.get(`${BASE_URL}/services`, { headers });

    if (patientsResponse.data.data?.length > 0 &&
        usersResponse.data.data?.length > 0 &&
        servicesResponse.data.data?.length > 0) {

      const patient = patientsResponse.data.data[0];
      const doctor = usersResponse.data.data[0];
      const service = servicesResponse.data.data[0];

      console.log('Using patient:', patient._id, patient.firstName, patient.lastName);
      console.log('Using doctor:', doctor._id, doctor.firstName, doctor.lastName);
      console.log('Using service:', service._id, service.name);

      const appointmentData = {
        patient: patient._id,
        dermatologist: doctor._id,
        service: service._id,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        startTime: '10:00 AM',
        endTime: '10:30 AM',
        reason: 'Test appointment creation',
        status: 'scheduled'
      };

      console.log('Appointment data:', JSON.stringify(appointmentData, null, 2));

      const appointmentResponse = await axios.post(`${BASE_URL}/appointments`, appointmentData, { headers });

      if (appointmentResponse.data.success) {
        console.log('✅ Appointment creation - Success');
        console.log('   Created appointment ID:', appointmentResponse.data.data._id);
      } else {
        console.log('❌ Appointment creation - Failed:', appointmentResponse.data);
      }
    } else {
      console.log('❌ Cannot test appointment creation - missing required data');
      console.log('   Patients:', patientsResponse.data.data?.length || 0);
      console.log('   Doctors:', usersResponse.data.data?.length || 0);
      console.log('   Services:', servicesResponse.data.data?.length || 0);
    }
  } catch (error) {
    console.log('❌ Appointment creation error:', error.response?.data || error.message);
  }
}

// Run tests
testEndpoints().then(() => {
  console.log('\n🎉 API Tests Completed!');
}).catch(error => {
  console.error('Test error:', error);
});
