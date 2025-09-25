const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const testAPI = async () => {
  try {
    console.log('🚀 Testing Event Booking System API...\n');

    // Test 1: Health check
    console.log('1. Testing health check endpoint...');
    const health = await axios.get(`${BASE_URL}/`);
    console.log('✅ Health check:', health.data.message);

    // Test 2: Get all events
    console.log('\n2. Testing get all events...');
    const events = await axios.get(`${BASE_URL}/api/events`);
    console.log(`✅ Found ${events.data.data.length} events`);

    if (events.data.data.length > 0) {
      console.log('   Sample event:', events.data.data[0].name);
    }

    // Test 3: Register a user
    console.log('\n3. Testing user registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    try {
      const register = await axios.post(`${BASE_URL}/register`, registerData);
      console.log('✅ Registration successful');
      
      // Test 4: Login
      console.log('\n4. Testing user login...');
      const login = await axios.post(`${BASE_URL}/login`, {
        email: registerData.email,
        password: registerData.password
      });
      console.log('✅ Login successful');
      
      const token = login.data.token;
      
      // Test 5: Get user bookings (should be empty initially)
      console.log('\n5. Testing get user bookings...');
      const bookings = await axios.get(`${BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ User has ${bookings.data.data.length} bookings`);

    } catch (error) {
      if (error.response?.status === 400) {
        console.log('⚠️  User already exists, skipping registration test');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📋 API is ready for use with the frontend!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run seed (to add sample events)');
    console.log('2. Update frontend API base URL to: http://localhost:5000');
    console.log('3. Start using the application!');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

// Wait for server to start
setTimeout(testAPI, 2000);
