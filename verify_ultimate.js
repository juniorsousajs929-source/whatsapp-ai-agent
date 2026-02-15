const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function verifyUltimateHumanization() {
    console.log("=== VERIFICAÇÃO FINAL: HUMANIZAÇÃO E REGRAS RÍGIDAS (V2) ===");
    const userId = "test_user_chile_" + Date.now();

    console.log("\n--- TESTE 1: POPULANDO HISTÓRICO (CHILE) ---");
    await generateResponse(userId, "Hola! Soy Maria de Chile.", SYSTEM_INSTRUCTION);
    await generateResponse(userId, "Peso 80kg y quiero bajar 10kg. Mi problema es la comida.", SYSTEM_INSTRUCTION);

    console.log("\n--- TESTE 2: PEDINDO PREÇO (DEVE SER CLP) ---");
    const res1 = await generateResponse(userId, "Me parece muy bien el metodo. ¿Cuál es el precio?", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${res1}`);

    if (!res1.includes("CLP")) {
        console.log("❌ FAILED: AI did not mention CLP for a Chilean user.");
    } else {
        console.log("✅ SUCCESS: AI gave local Chilean price correctly (with USD as anchor).");
    }

    console.log("\n--- TESTE 3: RESPEITO AO 'NÃO' ---");
    const res2 = await generateResponse(userId, "No gracias, es muy caro para mi ahora.", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${res2}`);

    if (res2.toLowerCase().includes("oferta") || res2.toLowerCase().includes("inscripción") || res2.toLowerCase().includes("cupo")) {
        console.log("❌ FAILED: AI kept selling after rejection.");
    } else {
        console.log("✅ SUCCESS: AI respected the refusal.");
    }
}

verifyUltimateHumanization();
