const axios = require('axios');

const updateProduct = async () => {
    try {
        const id = 6;
        const data = {
            name: 'helmet',
            category_id: 1,
            stock: 13,
            size_stock: { M: 2, L: 10, XL: 1 }
        };
        console.log('Sending update for product 6:', data);
        const res = await axios.put(`http://localhost:5000/api/products/${id}`, data);
        console.log('Update success! Response size_stock:', res.data.size_stock);
        
        // Fetch again to verify
        const res2 = await axios.get(`http://localhost:5000/api/products`);
        const p = res2.data.find(x => x.id === id);
        console.log('Fetched product 6 size_stock:', p.size_stock);
    } catch (e) {
        console.error('Update failed:', e.message);
        if (e.response) console.log('Response data:', e.response.data);
    }
};

updateProduct();
