const axios = require('axios');

const BASE_URL = 'https://manychat-ai-agent.onrender.com';
// const BASE_URL = 'http://localhost:3000'; // Toggle for local testing

async function testRotator() {
    console.log("🔄 TESTING ROTATOR (Check Distribution)...");
    const counts = {};
    for (let i = 0; i < 10; i++) {
        try {
            const res = await axios.get(`${BASE_URL}/rotator`, { maxRedirects: 0, validateStatus: null });
            const location = res.headers.location;
            console.log(`[${i + 1}] Redirect -> ${location}`);

            if (location) {
                const key = location.includes('QLD') ? 'ZAP 4' : (location.includes('VMP') ? 'ZAP 5' : 'OTHER');
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
            user_id: `test_user_${botId}_${Date.now()}`,
            message: "Hola, como funciona?"
        };

        const res = await axios.post(`${BASE_URL}/webhook?bot_id=${botId}`, payload);
        console.log(`✅ [${botId}] Status:`, res.status);
        console.log(`✅ [${botId}] Reply:`, res.data.ai_reply ? res.data.ai_reply.substring(0, 50) + "..." : "NO REPLY");
    } catch (e) {
        console.error(`❌ [${botId}] FAILED:`, e.response ? e.response.data : e.message);
    }
}

async function run() {
    await testRotator();
    await testWebhook('zap4');
    await testWebhook('zap5');
}

run();
