const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function testSalesPitch() {
    console.log("=== TESTE DA COPIA DE 1 MILHÃO (D22 SALES PITCH) ===");
    const userId = "sales_test_" + Date.now();

    // Context: Diagnosis is already done
    console.log("\n👤 USER: Sí, cuéntame sobre el programa.");
    const res = await generateResponse(userId, "Sí, cuéntame sobre el programa.", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Presentation): ${res}`);

    if (res.includes("Reto Detox") && res.includes("Alimentación Saludable") && res.includes("22 días")) {
        console.log("\n✅ Script Fidelity: OK");
    } else {
        console.log("\n❌ Script Fidelity: FAILED (Missing key phases)");
    }

    console.log("\n👤 USER: ¿Cuánto cuesta?");
    const priceRes = await generateResponse(userId, "¿Cuánto cuesta?", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Offer): ${priceRes}`);

    if (priceRes.includes("1200 dólares") && priceRes.includes("CLP") || priceRes.includes("MXN") || priceRes.includes("COP")) {
        console.log("\n✅ Anchor & Pricing: OK");
    } else {
        console.log("\n❌ Anchor & Pricing: FAILED");
    }
}

testSalesPitch();
