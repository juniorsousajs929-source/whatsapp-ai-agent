const axios = require('axios');

const BASE_URL = 'http://localhost:3000/webhook';
const USER_ID = 'test_user_123';

async function sendMessage(text) {
    console.log(`\n🔴 User: "${text}"`);
    try {
        const res = await axios.post(BASE_URL, {
            user_id: USER_ID,
            message: text
        });
        // The server returns JSON with ai_reply (thanks to our sync update)
        if (res.data && res.data.ai_reply) {
            console.log(`🟢 AI: "${res.data.ai_reply}"`);
            return res.data.ai_reply;
        } else {
            console.log("⚠️ No reply in response body (Are we using async mode or sync mode?)");
            console.log(res.data);
        }
    } catch (error) {
        console.error("Error sending message:", error.message);
    }
}

async function runSimulation() {
    console.log("--- Starting Conversation Simulation ---");

    // Turn 1: Intro
    await sendMessage("Hola");

    // Turn 2: Context (Weight loss)
    await sendMessage("Quiero perder 5kg");

    // Turn 3: Conversion (Price/Link)
    await sendMessage("Como funciona e qual o preço?");

    console.log("\n--- End Simulation ---");
}

// Wait for server to be ready then run
setTimeout(runSimulation, 2000);
