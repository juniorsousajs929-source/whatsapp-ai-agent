const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');
const manychatService = require('./src/services/manychatService');

// MOCK ManyChat
manychatService.addTagByName = async (userId, tagName, botId) => {
    console.log(`\n✅ [MOCK ManyChat] ADDING TAG: '${tagName}' to User: ${userId}`);
    return true;
};
manychatService.setCustomFieldByName = async () => { }; // Mock Name saving too

async function runFlow() {
    const userId = "tag_flow_test_" + Date.now();
    console.log(`\n=== STARTING FULL FLOW TEST for ${userId} ===`);

    // 1. Greeting
    let response = await generateResponse(userId, "Hola", SYSTEM_INSTRUCTION);
    console.log("🤖 AI:", response.substring(0, 50) + "...");

    // 2. Name & Country
    response = await generateResponse(userId, "Soy Carlos de Mexico", SYSTEM_INSTRUCTION);
    console.log("🤖 AI:", response.substring(0, 50) + "...");

    // 3. Problem & Goal (Answering Diagnosis)
    console.log("\n👤 USER: Peso 80kg y quiero bajar 10kg. Mi problema es la ansiedad.");
    response = await generateResponse(userId, "Peso 80kg y quiero bajar 10kg. Mi problema es la ansiedad.", SYSTEM_INSTRUCTION);
    console.log("🤖 AI:", response.substring(0, 50) + "...");

    // 4. Force Price/Close 
    // AI should now be ready to explain the solution and then give price
    console.log("\n👤 USER: Entiendo. ¿Cómo funciona y cuánto cuesta?");
    response = await generateResponse(userId, "Entiendo. ¿Cómo funciona y cuánto cuesta?", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI RESPONSE (Snippet):\n${response.substring(0, 150)}...`);

    // 5. If it gave explanation but not price, ask again (Pacing)
    if (!response.includes("PAGO ÚNICO")) {
        console.log("\n👤 USER: ok, me gusta. cual es el precio?");
        response = await generateResponse(userId, "ok, me gusta. cual es el precio?", SYSTEM_INSTRUCTION);
        console.log(`🤖 AI RESPONSE (Snippet):\n${response.substring(0, 150)}...`);
    }

    // CHECK TAG
    if (response.includes("PAGO ÚNICO") || response.includes("hotmart")) {
        console.log("\n✅ Price Delivered.");
    } else {
        console.log("\n❌ Price NOT Delivered (AI might be stuck in diagnosis).");
    }
}

runFlow();
