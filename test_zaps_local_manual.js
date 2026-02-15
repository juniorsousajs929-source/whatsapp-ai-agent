const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testRotator() {
    console.log("🔄 TESTING ROTATOR (Check Distribution)...");
    const counts = {};
    for (let i = 0; i < 10; i++) {
        try {
            const res = await axios.get(`${BASE_URL}/rotator`, { maxRedirects: 0, validateStatus: null });
            const location = res.headers.location;
            console.log(`[${i + 1}] Redirect -> ${location}`);

            if (location) {
                const key = location.includes('QLD') ? 'ZAP 4' : (location.includes('VMP') ? 'ZAP 5' : (location.includes('KU7') ? 'ZAP 6' : 'OTHER'));
                counts[key] = (counts[key] || 0) + 1;
            }
        } catch (e) {
            console.error("Rotator Error:", e.message);
        }
    }
    console.log("📊 Distribution:", counts);
}

async function testWebhook(botId) {
    console.log(`\n🤖 TESTING WEBHOOK (${botId})...`);
    try {
        const payload = {
            user_id: `test_user_manual_${botId}_${Date.now()}`,
            message: "Hola, me gustaría saber más información sobre el producto."
        };

        const res = await axios.post(`${BASE_URL}/webhook?bot_id=${botId}`, payload);
        console.log(`✅ [${botId}] Status:`, res.status);
        console.log(`✅ [${botId}] Reply:`, res.data.ai_reply);
    } catch (e) {
        console.error(`❌ [${botId}] FAILED:`, e.response ? e.response.data : e.message);
    }
}

async function run() {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testRotator();
    await testWebhook('zap4');
    await testWebhook('zap5');
    await testWebhook('zap6');
}

run();
