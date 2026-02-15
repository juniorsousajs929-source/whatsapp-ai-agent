const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function testGoldenFlow() {
    console.log("=== TESTE DO FLUXO DE OURO (SEQUÊNCIA DO USER) ===");
    const userId = "golden_user_" + Date.now();

    // TURN 1: Greet and ask Name + Country
    console.log("\n👤 USER: Hola!");
    const res1 = await generateResponse(userId, "Hola!", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Turn 1): ${res1}`);

    // TURN 2: Provide Name/Country -> Expect "Save Contact" message
    console.log("\n👤 USER: Soy Maria de Colombia");
    const res2 = await generateResponse(userId, "Soy Maria de Colombia", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Turn 2 - Expected Save Contact): ${res2}`);

    // TURN 3: Positive response -> Expect Diagnosis (Weight/Goal)
    console.log("\n👤 USER: Listo, agregado!");
    const res3 = await generateResponse(userId, "Listo, agregado!", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Turn 3 - Expected Diagnosis): ${res3}`);

    console.log("\n=== FIM DO TESTE ===");
}

testGoldenFlow();
