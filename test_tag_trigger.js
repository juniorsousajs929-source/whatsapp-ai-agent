const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

// MOCK the ManyChat Service to track calls
const manychatService = require('./src/services/manychatService');

// Override addTagByName to log instead of calling API
manychatService.addTagByName = async (userId, tagName, botId) => {
    console.log(`\n✅ [MOCK ManyChat] ADDING TAG: '${tagName}' to User: ${userId}`);
    return true;
};

async function testTagTrigger() {
    console.log("=== TEST AUTO-TAGGING ON PRICE DELIVERY ===");
    const userId = "tag_tester_" + Date.now();

    // 1. User asks for price (simulating end of flow)
    console.log("\n👤 USER: Quiero saber el precio soy de Mexico");
    const res = await generateResponse(userId, "Quiero saber el precio soy de Mexico", SYSTEM_INSTRUCTION);

    console.log(`🤖 AI RESPONSE (Snippet):\n${res.substring(0, 100)}...`);

    // CHECK IF PRICE IS IN TEXT
    if (res.includes("PAGO ÚNICO") || res.includes("hotmart")) {
        console.log("\n✅ AI delivered the price/link.");
    } else {
        console.log("\n❌ AI did NOT deliver price. Test inconclusive.");
    }

    // The actual check for the tag happens in the mocked function log above.
}

testTagTrigger();
