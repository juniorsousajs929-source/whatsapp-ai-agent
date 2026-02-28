const axios = require('axios');

async function checkMissingBotIdAmnesia() {
    const renderUrl = "https://manychat-ai-agent.onrender.com";
    const mockUserId = "gloria_amnesia_test_100";

    console.log(`\n--- STEP 1: First Webhook (WITH bot_id=zap4) ---`);
    try {
        await axios.post(`${renderUrl}/webhook?bot_id=zap4`, {
            user_id: mockUserId,
            message: "Hola! quiero info de la dieta"
        });

        console.log("Waiting 3 seconds for processing...");
        await new Promise(r => setTimeout(r, 3000));

        console.log(`\n--- STEP 2: Second Webhook (WITHOUT bot_id, like ManyChat Custom Field triggers) ---`);
        await axios.post(`${renderUrl}/webhook`, {
            user_id: mockUserId,
            message: "Gloria España"
        });

        console.log("Waiting 3 seconds for processing...");
        await new Promise(r => setTimeout(r, 3000));

    } catch (e) {
        console.error("Test failed:", e.message);
    }
}

checkMissingBotIdAmnesia();
