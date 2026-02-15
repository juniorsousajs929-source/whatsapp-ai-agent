const axios = require('axios');

const LIVE_URL = "https://manychat-ai-agent.onrender.com/webhook";
const USER_ID = "tester_12345";

async function testLive() {
    console.log("🚀 TESTING LIVE SERVER (Anti-Echo & Speed)...");

    // 1. Send First Message
    console.log("\n1️⃣ Sending 'Hola'...");
    const start1 = Date.now();
    try {
        const res1 = await axios.post(LIVE_URL, {
            user_id: USER_ID,
            message: "Hola"
        });
        const time1 = Date.now() - start1;
        console.log(`✅ Response 1 (${time1}ms):`, res1.data);

        const aiReply = res1.data.ai_reply;

        if (!aiReply) {
            console.error("❌ No AI Reply received!");
            return;
        }

        // 2. Simulate ECHO (ManyChat sends back the AI reply as user input)
        console.log(`\n2️⃣ Simulating ECHO (User sending back: "${aiReply}")...`);
        const start2 = Date.now();
        const res2 = await axios.post(LIVE_URL, {
            user_id: USER_ID,
            message: aiReply // The ECHO
        });
        const time2 = Date.now() - start2;
        console.log(`✅ Response 2 (${time2}ms):`, res2.data);

        if (res2.data.status === 'ignored_echo') {
            console.log("🎉 SUCCESS: Echo was IGNORED by the server!");
        } else {
            console.error("❌ FAILURE: Server replied to the echo! (Loop risk)");
        }

        // 3. Send Real Follow-up
        console.log("\n3️⃣ Sending Real Follow-up ('Quiero perder 5kg')...");
        const start3 = Date.now();
        const res3 = await axios.post(LIVE_URL, {
            user_id: USER_ID,
            message: "Quiero perder 5kg"
        });
        const time3 = Date.now() - start3;
        console.log(`✅ Response 3 (${time3}ms):`, res3.data);

    } catch (error) {
        console.error("❌ TEST FAILED:", error.message);
        if (error.response) console.error("Server Error:", error.response.data);
    }
}

testLive();
