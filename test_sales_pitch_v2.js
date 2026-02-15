const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function testSalesPitchFull() {
    console.log("=== TESTE DA COPIA DE 1 MILHÃO (V2 - COM HISTÓRICO) ===");
    const userId = "sales_v2_" + Date.now();

    // TURN 1: Diagnosis done
    console.log("👤 USER (History): Soy Maria de Chile, peso 80kg y quiero bajar 10.");
    await generateResponse(userId, "Soy Maria de Chile, peso 80kg y quiero bajar 10.", SYSTEM_INSTRUCTION);

    // TURN 2: Ask for program
    console.log("\n👤 USER: Cuéntame sobre el programa.");
    const res = await generateResponse(userId, "Cuéntame sobre el programa.", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Presentation):\n${res}`);

    const hasSafeTerm = res.includes("Reinicio Natural") || res.includes("Limpieza Orgánica") || res.includes("desinflama");
    const hasD22 = res.includes("D22") || res.includes("22 días");

    if (hasSafeTerm && hasD22) {
        console.log("\n✅ Script Fidelity: OK (D22 and Safe Reinicio mentioned)");
    } else {
        console.log("\n❌ Script Fidelity: FAILED (Missing phases)");
    }

    // TURN 3: Price
    console.log("\n👤 USER: ¿Cuánto cuesta?");
    const priceRes = await generateResponse(userId, "¿Cuánto cuesta?", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Offer):\n${priceRes}`);


    if (priceRes.includes("41.994") && priceRes.includes("CLP")) {
        console.log("\n✅ Anchor & Pricing: OK (Correct CLP value)");
    } else {
        console.log("\n❌ Anchor & Pricing: FAILED (Expected 41.994 CLP)");
    }
}

testSalesPitchFull();
