const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function testPacing() {
    console.log("=== TESTE DE CADÊNCIA (UMA PERGUNTA POR VEZ) ===");
    const userId = "test_user_pacing_" + Date.now();

    // 1. User says Hola
    console.log("\n👤 USER: Hola!");
    const res1 = await generateResponse(userId, "Hola!", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${res1}`);

    // 2. User gives Name
    console.log("\n👤 USER: Soy Maria");
    const res2 = await generateResponse(userId, "Soy Maria", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${res2}`);

    // 3. User gives Country
    console.log("\n👤 USER: Soy de Chile");
    const res3 = await generateResponse(userId, "Soy de Chile", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${res3}`);

    console.log("\n(Verifique se a IA pediu apenas uma coisa de cada vez)");
}

testPacing();
