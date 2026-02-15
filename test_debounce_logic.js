
// Mock Express functionality to test the Debounce Logic
const { generateResponse } = require('./src/services/aiService');
const { setCustomFieldByName } = require('./src/services/manychatService');

// MOCK DEPENDENCIES
const messageBuffers = {};
let userId = "test_user_debounce";
let botId = "default_bot";

// Mock Handler (Copied logic for testing)
function mockWebhookHandler(req, res) {
    const { user_id, message } = req.body;

    if (!messageBuffers[user_id]) {
        messageBuffers[user_id] = { messages: [], timer: null };
    }

    messageBuffers[user_id].messages.push(message);

    if (messageBuffers[user_id].timer) clearTimeout(messageBuffers[user_id].timer);

    console.log(`[TEST] Buffering message: "${message}"`);

    messageBuffers[user_id].timer = setTimeout(() => {
        const finalContext = messageBuffers[user_id].messages.join('\n');
        console.log(`[TEST] ⏰ TIMEOUT! Processing combined: "${finalContext.replace(/\n/g, ' + ')}"`);
        delete messageBuffers[user_id];
    }, 2000); // 2 seconds for test speed

    res.status(200).send("Buffered");
}

async function runTest() {
    console.log("🚀 STARTING DEBOUNCE LOGIC TEST...");

    const resMock = {
        status: (code) => ({
            send: (msg) => console.log(`[SERVER RES] ${code} ${msg}`),
            json: (obj) => console.log(`[SERVER RES] ${code} JSON`)
        })
    };

    // Simulate 3 rapid requests
    mockWebhookHandler({ body: { user_id: userId, message: "Hola" } }, resMock);
    await new Promise(r => setTimeout(r, 500));

    mockWebhookHandler({ body: { user_id: userId, message: "Soy Maria" } }, resMock);
    await new Promise(r => setTimeout(r, 500));

    mockWebhookHandler({ body: { user_id: userId, message: "Quiero bajar peso" } }, resMock);

    console.log("[TEST] Waiting for processing...");
    await new Promise(r => setTimeout(r, 3000));

    console.log("✅ TEST COMPLETE. If you saw only ONE 'Processing combined' message with all 3 parts, it works.");
}

runTest();
