
const { generateResponse } = require('./src/services/aiService');
require('dotenv').config();

const userId = 'test_loop_' + Date.now();

async function runTest() {
    console.log("🚀 STARTING ANTI-LOOP TEST...");

    // Scenario: User gives name AND weight in the first turn.
    // Bot should Greeting -> Save Contact -> (SKIP WEIGHT) -> Ask Difficulty.

    // Actually, wait. The flow is:
    // 1. Bot: Greeting + Ask Name
    // 2. User: "Soy Maria y peso 90kg"
    // 3. Bot: Save Contact + (Should Skip Weight) -> Ask Difficulty?
    // Let's see if it combines them or skips.

    console.log("\n--- SCENARIO 1: PRE-EMPTIVE INFO ---");
    let history = [];

    // Turn 1: AI Greeting
    let userMsg = "Hola";
    console.log(`👤 User: ${userMsg}`);
    let response = await generateResponse(userId, userMsg, require('./src/config/prompt').SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${response}`);

    // Turn 2: User gives Name + Weight
    userMsg = "Soy Maria y actualmente peso 90kg, quiero bajar 10.";
    console.log(`👤 User: ${userMsg}`);
    response = await generateResponse(userId, userMsg, require('./src/config/prompt').SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${response}`);

    if (response.includes("Cuántos kilos pesas")) {
        console.error("❌ FAILED: AI asked for weight even though user provided it.");
        process.exit(1);
    } else if (response.includes("dificultad")) {
        console.log("✅ PASSED: AI skipped weight question and asked for difficulty.");
    } else {
        console.log("⚠️ UNDETERMINED: AI might have saved contact only. Checking content...");
    }

}

runTest();
