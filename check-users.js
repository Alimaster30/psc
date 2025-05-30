// Simple script to check users in MongoDB Atlas
fetch('https://prime-skin-clinic-api.onrender.com/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('Backend health:', data);
    
    // Now try to login with the admin credentials
    return fetch('https://prime-skin-clinic-api.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@psc.com',
        password: 'Admin123!'
      })
    });
  })
  .then(response => {
    console.log('Login response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Login response:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
