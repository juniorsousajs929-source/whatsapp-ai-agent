const axios = require('axios');

// TEST ZAP 3 (Local)
const LOCAL_URL = "http://localhost:3000/webhook?bot_id=zap3";
const USER_ID = "tester_zap3_debug";

async function testZap3Local() {
    console.log("🚀 TESTING ZAP 3 LOCALLY...");

    console.log("\n1️⃣ Sending 'Hola' to Zap 3...");
    try {
        const res1 = await axios.post(LOCAL_URL, {
            user_id: USER_ID,
            message: "Hola"
        });
        console.log(`✅ Response 1:`, res1.data);
    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        if (error.response) console.error("Server Error:", error.response.data);
    }
}

testZap3Local();
