const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test login first
    console.log('1. Testing login...');
    const loginResponse = await axios.post('https://prime-skin-clinic-api.onrender.com/api/auth/login', {
      email: 'admin@psc.com',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Test users endpoint
    console.log('\n2. Testing users endpoint...');
    const usersResponse = await axios.get('https://prime-skin-clinic-api.onrender.com/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Users endpoint successful');
    console.log(`📊 Found ${usersResponse.data.count} users:`);
    
    usersResponse.data.data.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email} (${user.role})`);
    });
    
    // Check for Tahir Ali specifically
    const tahirUser = usersResponse.data.data.find(user => 
      user.firstName === 'Tahir' && user.lastName === 'Ali'
    );
    
    if (tahirUser) {
      console.log('\n🎯 Found Tahir Ali user:');
      console.log(`   Name: ${tahirUser.firstName} ${tahirUser.lastName}`);
      console.log(`   Email: ${tahirUser.email}`);
      console.log(`   Role: ${tahirUser.role}`);
      console.log(`   Active: ${tahirUser.isActive}`);
      console.log(`   ID: ${tahirUser._id}`);
    } else {
      console.log('\n❌ Tahir Ali user not found in API response');
    }
    
    console.log('\n🎉 API test completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPI();
