// Debug the receipt API response structure
const axios = require('axios');

const BASE_URL = 'https://prime-skin-clinic-api.onrender.com/api';
const BILLING_ID = '683a288a9e8937e904f8c348'; // Aisha Malik's billing ID

async function debugReceipt() {
  try {
    console.log('🔍 Debugging Receipt API Response...\n');
    
    // Login as admin
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@psc.com',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Fetch the specific billing record
    console.log(`\n🔍 Fetching billing record: ${BILLING_ID}`);
    const response = await axios.get(`${BASE_URL}/billing/${BILLING_ID}`, { headers });
    
    console.log('\n📋 Full API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const billing = response.data.data;
    
    console.log('\n🎯 Key Fields Check:');
    console.log(`- Patient: ${billing.patient ? 'EXISTS' : 'MISSING'}`);
    if (billing.patient) {
      console.log(`  - firstName: ${billing.patient.firstName || 'MISSING'}`);
      console.log(`  - lastName: ${billing.patient.lastName || 'MISSING'}`);
      console.log(`  - email: ${billing.patient.email || 'MISSING'}`);
      console.log(`  - phoneNumber: ${billing.patient.phoneNumber || 'MISSING'}`);
    }
    
    console.log(`- Services: ${billing.services ? `${billing.services.length} items` : 'MISSING'}`);
    if (billing.services && billing.services.length > 0) {
      billing.services.forEach((service, index) => {
        console.log(`  Service ${index + 1}:`);
        console.log(`    - name: ${service.name || 'MISSING'}`);
        console.log(`    - description: ${service.description || 'MISSING'}`);
        console.log(`    - amount: ${service.amount || service.unitPrice || service.totalPrice || 'MISSING'}`);
      });
    }
    
    console.log(`- Invoice Number: ${billing.invoiceNumber || 'MISSING'}`);
    console.log(`- Date: ${billing.date || billing.createdAt || 'MISSING'}`);
    console.log(`- Total: ${billing.total || 'MISSING'}`);
    console.log(`- Payment Method: ${billing.paymentMethod || 'MISSING'}`);
    console.log(`- Created By: ${billing.createdBy ? 'EXISTS' : 'MISSING'}`);
    if (billing.createdBy) {
      console.log(`  - firstName: ${billing.createdBy.firstName || 'MISSING'}`);
      console.log(`  - lastName: ${billing.createdBy.lastName || 'MISSING'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugReceipt();
