const axios = require('axios');

const BASE_URL = "https://manychat-ai-agent.onrender.com/webhook";
const USER_ID = "tester_multizap";

async function testBot(botId, name) {
    console.log(`\n🤖 TESTING ${name} (bot_id=${botId})...`);
    try {
        const start = Date.now();
        const res = await axios.post(`${BASE_URL}?bot_id=${botId}`, {
            user_id: USER_ID,
            message: "Hola, funciona?"
        });
        const duration = Date.now() - start;

        if (res.data.ai_reply) {
            console.log(`✅ SUCCESS: ${name} replied in ${duration}ms!`);
            console.log(`   Reply: "${res.data.ai_reply.substring(0, 50)}..."`);
        } else {
            console.error(`❌ FAILURE: ${name} returned no reply.`);
            console.error(`   Response:`, res.data);
        }
    } catch (error) {
        console.error(`❌ ERROR on ${name}:`, error.message);
        if (error.response) console.error("   Server details:", error.response.data);
    }
}

async function runTests() {
    console.log("🚀 STARTING HYDRA TRIPLE CHECK...");

    await testBot("zap1", "ZAP 1 (Recuperado)");
    await testBot("zap2", "ZAP 2 (Antigo)");
    await testBot("zap3", "ZAP 3 (Novo)");

    console.log("\n🏁 TEST COMPLETE.");
}

runTests();
