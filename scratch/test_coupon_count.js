
const axios = require('axios');

async function testCouponCount() {
  const API_URL = "http://localhost:3000/api/admin/content/coupon?select=_id";
  const API_KEY = "1tNMPQvO5jA8EgR2sJLI2MGoPKYqgo";

  try {
    const response = await axios.get(API_URL, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    console.log('API Response Status:', response.status);
    console.log('Count in response:', response.data.data.count); // Wait, successData returns it in data.count
    console.log('Full Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testCouponCount();
