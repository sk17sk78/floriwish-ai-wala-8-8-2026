
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/frontend/content-page?slug=cake-with-flowers'; // Assuming this slug exists

async function verifyCoupons() {
    try {
        console.log(`Fetching coupons for ${API_URL}...`);
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data && data.data && data.data._coupons) {
            console.log(`Found ${data.data._coupons.length} coupons:`);
            data.data._coupons.forEach(c => {
                console.log(`- ${c.code} (${c.type})`);
            });
        } else {
            console.log('No coupons found in response.');
            console.log('Full response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error fetching API:', error.message);
        console.log('Note: Ensure the local server is running on http://localhost:3000');
    }
}

verifyCoupons();
