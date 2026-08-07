
async function testAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/content/coupon?select=_id', {
            headers: { 'x-api-key': '9087' }
        });
        const json = await response.json();
        console.log('API Response:', JSON.stringify(json, null, 2));
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testAPI();
