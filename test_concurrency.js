const axios = require('axios');

async function testConcurrency() {
    const url = 'http://localhost:3000/webhook?bot_id=test_zap';

    console.log("🔥 Firing 3 identical webhooks instantly (Simulating ManyChat Retry Bug)");

    // Fire 3 simultaneous requests
    const p1 = axios.post(url, { user_id: 'stress_user_1', message: 'Hello AI' });
    const p2 = axios.post(url, { user_id: 'stress_user_1', message: 'Hello AI' });
    const p3 = axios.post(url, { user_id: 'stress_user_1', message: 'Hello AI' });

    try {
        const results = await Promise.all([p1, p2, p3]);
        results.forEach((r, i) => console.log(`Response ${i + 1}:`, r.data));
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testConcurrency();
