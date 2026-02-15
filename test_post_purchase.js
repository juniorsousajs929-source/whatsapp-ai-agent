const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function testPostPurchase() {
    console.log("=== TEST POST-PURCHASE INSTRUCTIONS ===");
    const userId = "buyer_" + Date.now();

    // TURN 1: User says they bought it
    console.log("\n👤 USER: Listo, ya pagué. Ya tengo el recibo.");
    const res = await generateResponse(userId, "Listo, ya pagué. Ya tengo el recibo.", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI (Post-Purchase Guidance):\n${res}`);

    // CHECK
    const checks = [
        { term: "CORREO ELECTRÓNICO", label: "Mentions Email" },
        { term: "SPAM", label: "Mentions Spam" },
        { term: "DIFERENTE", label: "Sales Link != Access Link" },
        { term: "CONTRASEÑA", label: "Mentions Password Creation" }
    ];

    let passed = true;
    for (const check of checks) {
        if (res.includes(check.term)) {
            console.log(`✅ ${check.label}: OK`);
        } else {
            console.log(`❌ ${check.label}: FAILED`);
            passed = false;
        }
    }

    if (passed) {
        console.log("\n✅ ALL CHECKS PASSED: AI gave correct access instructions.");
    } else {
        console.log("\n❌ SOME CHECKS FAILED: AI missing key instructions.");
    }
}

testPostPurchase();
