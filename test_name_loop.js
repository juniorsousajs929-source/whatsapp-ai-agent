const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function testNameLoop() {
    console.log("=== TEST REPRODUCTION: NAME LOOP ===");
    const userId = "name_loop_" + Date.now();

    // TURN 1: Initial Trigger
    console.log("\n👤 USER: Hola! quiero info de la dieta");
    const res1 = await generateResponse(userId, "Hola! quiero info de la dieta", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Greeting):\n${res1}`);

    // TURN 2: Providing Name and Country
    console.log("\n👤 USER: Andrea Sevilla España");
    const res2 = await generateResponse(userId, "Andrea Sevilla España", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Response 2):\n${res2}`);

    // CHECK
    if (res2.includes("Hola, ¿cómo estás? Soy la Dra. Adriele")) {
        console.log("\n❌ FAIL: AI repeated the initial greeting!");
    } else if (res2.includes("Encantada") || res2.includes("Andrea")) {
        console.log("\n✅ PASS: AI recognized the name and moved to Step 2.");
    } else {
        console.log("\n⚠️ WARNING: AI gave an unexpected response.");
    }
}

testNameLoop();
