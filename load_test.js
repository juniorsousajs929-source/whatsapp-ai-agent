const axios = require('axios');

const CONCURRENT_USERS = 5; // Live Test (Small Burst)
const SERVER_URL = 'https://manychat-ai-agent.onrender.com/webhook';

async function sendMessage(userId) {
    try {
        const start = Date.now();
        const response = await axios.post(SERVER_URL, {
            user_id: `load_test_user_${userId}`,
            message: "Quero perder 5kg",
            // Simulating different bots to test Hydra too
            // bot_id is not in body but query param usually, let's append below
        });
        const duration = Date.now() - start;
        return { success: true, userId, duration, status: response.status };
    } catch (error) {
        return { success: false, userId, error: error.message };
    }
}

async function runLoadTest() {
    console.log(`🚀 STARTING LOAD TEST: ${CONCURRENT_USERS} simultaneous users...`);

    // Create array of promises (parallel requests)
    const promises = [];
    for (let i = 0; i < CONCURRENT_USERS; i++) {
        // Distribute load across 3 bots
        const botId = `zap${(i % 3) + 1}`;
        const url = `${SERVER_URL}?bot_id=${botId}`; // Hydra Query Param

        console.log(`👉 User ${i} sending message to Bot ${botId}...`);

        promises.push(axios.post(url, {
            user_id: `load_test_user_${i}`,
            message: "Olá, quero saber o preço"
        }).then(res => ({ id: i, status: res.status })).catch(err => ({ id: i, error: err.message })));
    }

    // Wait for all to finish
    const results = await Promise.all(promises);

    const success = results.filter(r => r.status === 200).length;
    const failed = results.filter(r => r.error).length;

    console.log("\n📊 RESULTADO DO TESTE DE CARGA:");
    console.log(`✅ Sucessos: ${success}`);
    console.log(`❌ Falhas: ${failed}`);

    if (failed > 0) {
        console.log("⚠️ Gargalo detectado! Precisamos de mais chaves de API.");
    } else {
        console.log("💎 Sistema aguentou o tranco!");
    }
}

runLoadTest();
