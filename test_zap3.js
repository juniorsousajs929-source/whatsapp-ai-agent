const axios = require('axios');

// TEST ZAP 3 (New Worker)
const LIVE_URL = "https://manychat-ai-agent.onrender.com/webhook?bot_id=zap3";
const USER_ID = "tester_zap3_new";

async function testZap3() {
    console.log("🚀 TESTING ZAP 3 (New Hydra Head)...");

    console.log("\n1️⃣ Sending 'Hola' to Zap 3...");
    const start1 = Date.now();
    try {
        const res1 = await axios.post(LIVE_URL, {
            user_id: USER_ID,
            message: "Hola"
        });
        const time1 = Date.now() - start1;
        console.log(`✅ Response 1 (${time1}ms):`, res1.data);

        if (res1.data.ai_reply) {
            console.log("🎉 SUCCESS: AI replied correctly for Zap 3!");
        } else {
            console.error("❌ FAILURE: No AI reply for Zap 3.");
        }

    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        if (error.response) console.error("Server Error:", error.response.data);
    }
}

testZap3();
