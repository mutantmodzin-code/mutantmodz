async function testPost() {
    try {
        const loginRes = await fetch('http://127.0.0.1:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        if (!token) throw new Error('Login failed: ' + JSON.stringify(loginData));

        const postRes = await fetch('http://127.0.0.1:3001/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Manual Test Product',
                category_id: 1,
                brand: 'ManualBrand',
                price: 999.99,
                stock: 10,
                supplier_id: 1
            })
        });

        const postData = await postRes.json();
        console.log('Post Status:', postRes.status);
        console.log('Post Result:', postData);
        process.exit(0);
    } catch (err) {
        console.error('Test Post Error:', err.message);
        process.exit(1);
    }
}
testPost();
