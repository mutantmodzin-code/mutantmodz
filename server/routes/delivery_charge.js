const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/delivery-charge?state=Tamil Nadu&city=Chennai
// Priority: city match → state-only match → default ₹300
router.get('/', async (req, res) => {
    const { state, city } = req.query;

    if (!state) {
        return res.json({ charge: 300 });
    }

    try {
        // 1. Try exact city + state match
        if (city) {
            const cityResult = await db.query(
                'SELECT charge FROM delivery_charges WHERE LOWER(state) = LOWER($1) AND LOWER(city) = LOWER($2)',
                [state, city]
            );
            if (cityResult.rows.length > 0) {
                return res.json({ charge: cityResult.rows[0].charge, matched: 'city' });
            }
        }

        // 2. Fallback: state-level match (city IS NULL)
        const stateResult = await db.query(
            'SELECT charge FROM delivery_charges WHERE LOWER(state) = LOWER($1) AND city IS NULL',
            [state]
        );
        if (stateResult.rows.length > 0) {
            return res.json({ charge: stateResult.rows[0].charge, matched: 'state' });
        }

        // 3. Default
        return res.json({ charge: 300, matched: 'default' });
    } catch (error) {
        console.error('DELIVERY CHARGE ERROR:', error.message);
        res.status(500).json({ charge: 300, error: error.message });
    }
});

module.exports = router;
