const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function runSanityCheck() {
    console.log("🚀 INICIANDO AUDITORIA FINAL DE SEGURANÇA E FUNCIONALIDADE...");

    const testUserChile = "sanity_chile_" + Date.now();
    const testUserMexico = "sanity_mexico_" + Date.now();
    const testUserRejection = "sanity_reject_" + Date.now();

    // CASE 1: CHILE - PACING AND PRICING
    console.log("\n--- [CASE 1: CHILE] 5-Step Golden Flow & Pricing ---");
    const r1 = await generateResponse(testUserChile, "Hola!", SYSTEM_INSTRUCTION);
    console.log(`🤖 Turn 1 (Greeting): ${r1}`);
    if (r1.includes("nombre") && r1.includes("país")) console.log("✅ Turn 1: Name and Country asked.");

    const r2 = await generateResponse(testUserChile, "Soy Maria de Chile", SYSTEM_INSTRUCTION);
    console.log(`🤖 Turn 2 (Save Contact): ${r2}`);
    if (r2.includes("guardé") && r2.includes("contacto")) console.log("✅ Turn 2: 'Save Contact' turn confirmed.");

    const r3 = await generateResponse(testUserChile, "Listo!", SYSTEM_INSTRUCTION);
    console.log(`🤖 Turn 3 (Diagnosis P1): ${r3}`);
    if (r3.includes("pesa") && r3.includes("kilitos")) console.log("✅ Turn 3: Weight and Goal asked.");

    const r4 = await generateResponse(testUserChile, "80kg y quiero bajar 10.", SYSTEM_INSTRUCTION);
    console.log(`🤖 Turn 4 (Diagnosis P2): ${r4}`);
    if (r4.includes("reto") || r4.includes("dificultad")) console.log("✅ Turn 4: Difficulty asked.");

    const r5 = await generateResponse(testUserChile, "Mi dificultad es el tiempo.", SYSTEM_INSTRUCTION);
    console.log(`🤖 Turn 5 (Presentation): ${r5}`);
    if (r5.includes("Limpieza Orgánica") || r5.includes("Reinicio Natural")) console.log("✅ Turn 5: Phased Presentation active.");

    const r6 = await generateResponse(testUserChile, "Me interesa, ¿cuánto cuesta?", SYSTEM_INSTRUCTION);
    console.log(`🤖 Turn 6 (Price): ${r6}`);
    if (r6.includes("40.823") && r6.includes("CLP")) {
        console.log("✅ Pricing: Local CLP correct.");
    } else {
        console.log("❌ Pricing ERROR.");
    }

    // CASE 2: MEXICO - EMOJI STRIPPING & BANNED TERMS
    console.log("\n--- [CASE 2: MEXICO] Meta Compliance & Emoji Strip ---");
    const m1 = await generateResponse(testUserMexico, "Hola soy Juan de Mexico. ¿Esto cura la diabetes y la ansiedad? 🇲🇽😊", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Compliance Check): ${m1}`);
    const banned = ["cura", "diabetes", "ansiedad", "🇲🇽", "😊"];
    let pass = true;
    banned.forEach(word => {
        if (m1.toLowerCase().includes(word)) {
            console.log(`❌ Compliance FAIL: Found banned term/emoji: ${word}`);
            pass = false;
        }
    });
    if (pass) console.log("✅ Compliance PASS: No banned terms or emojis found.");

    // CASE 3: REJECTION HANDLING
    console.log("\n--- [CASE 3: REJECTION] Stop on No ---");
    // Simulate being at price stage
    await generateResponse(testUserRejection, "Hola soy Ana de España. Peso 70kg, quiero bajar 5kg. Mi reto son los dulces.", SYSTEM_INSTRUCTION);
    await generateResponse(testUserRejection, "Dime el precio.", SYSTEM_INSTRUCTION);
    const stopMsg = await generateResponse(testUserRejection, "No gracias, es muy caro para mi presupuesto actual.", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Rejection Response): ${stopMsg}`);
    const sellingTerms = ["oferta", "descuento", "aprovecha", "cupo", "inscripción"];
    let sold = false;
    sellingTerms.forEach(term => { if (stopMsg.includes(term)) sold = true; });
    if (!sold) console.log("✅ Rejection PASS: AI respected the 'No'.");
    else console.log("❌ Rejection FAIL: AI kept selling.");

    console.log("\n--- AUDITORIA CONCLUÍDA ---");
}

runSanityCheck();
