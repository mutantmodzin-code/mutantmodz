const axios = require('axios');

async function testPost() {
    try {
        const loginRes = await axios.post('http://127.0.0.1:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;

        const postRes = await axios.post('http://127.0.0.1:3001/api/products', {
            name: 'Test Helmet',
            category_id: 1,
            brand: 'TestBrand',
            price: 1500,
            stock: 50,
            supplier_id: 1
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Post Result:', postRes.status, postRes.data);
    } catch (err) {
        console.error('Test Post Error:', err.response ? err.response.data : err.message);
    }
}
testPost();
