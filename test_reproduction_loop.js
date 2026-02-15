const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function testRepetitionLoop() {
    console.log("=== TEST REPRODUCTION: REPETITIVE SALES PITCH ===");
    const userId = "repro_user_" + Date.now();

    // TURN 1: Initial Diagnosis
    console.log("\n👤 USER: Soy Pedro, peso 98kg, mido 1.75, diabetes tipo 2.");
    await generateResponse(userId, "Soy Pedro, peso 98kg, mido 1.75, diabetes tipo 2.", SYSTEM_INSTRUCTION);

    // TURN 2: Trigger Pitch
    console.log("\n👤 USER: Cuéntame del programa.");
    const pitch = await generateResponse(userId, "Cuéntame del programa.", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Should be Pitch): [Length: ${pitch.length} chars]`);

    // TURN 3: Distraction (Should NOT trigger pitch again)
    console.log("\n👤 USER: Dame unos minutos, voy manejando.");
    const response1 = await generateResponse(userId, "Dame unos minutos, voy manejando.", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Response 1):\n${response1}`);

    // TURN 4: Another question (Should NOT trigger pitch again)
    console.log("\n👤 USER: Quiero mejorar la masa muscular.");
    const response2 = await generateResponse(userId, "Quiero mejorar la masa muscular.", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Response 2):\n${response2}`);

    // CHECK FOR REPETITION
    const isPitch = (text) => text.includes("Reset Digestivo") && text.includes("34,97 USD");

    if (isPitch(response1) || isPitch(response2)) {
        console.log("\n❌ FAIL: The AI repeated the full sales pitch!");
    } else {
        console.log("\n✅ PASS: The AI respected the context and did not repeat the pitch.");
    }
}

testRepetitionLoop();
