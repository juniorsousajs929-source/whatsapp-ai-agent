const axios = require('axios');

const LOCAL_URL = "http://localhost:3000/webhook?bot_id=zap_memory_test";
const USER_ID = "tester_amnesia";

async function testMemory() {
    console.log("🧠 TESTING AI MEMORY (Amnesia Check)...");

    // Turn 1
    console.log("\n1️⃣ User: 'Hola'");
    const res1 = await axios.post(LOCAL_URL, { user_id: USER_ID, message: "Hola" });
    const reply1 = res1.data.ai_reply;
    console.log(`🤖 Bot: "${reply1.substring(0, 50)}..."`);

    // Turn 2
    console.log("\n2️⃣ User: 'Me llamo Carlos'");
    const res2 = await axios.post(LOCAL_URL, { user_id: USER_ID, message: "Me llamo Carlos" });
    const reply2 = res2.data.ai_reply; // Should NOT be the greeting again
    console.log(`🤖 Bot: "${reply2.substring(0, 50)}..."`);

    if (reply1 === reply2) {
        console.error("❌ FAILURE: Bot repeated the EXACT same message! (Amnesia Confirmed)");
    } else {
        console.log("✅ SUCCESS: Bot gave a different response. Memory is working.");
    }

    // Turn 3
    console.log("\n3️⃣ User: 'Quiero perder peso'");
    const res3 = await axios.post(LOCAL_URL, { user_id: USER_ID, message: "Quiero perder peso" });
    console.log(`🤖 Bot: "${res3.data.ai_reply.substring(0, 50)}..."`);
}

testMemory();
