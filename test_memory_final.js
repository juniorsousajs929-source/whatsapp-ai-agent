const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');
const fs = require('fs');

async function testMemoryPersistence() {
    console.log("🔍 TESTANDO MEMÓRIA E PERSISTÊNCIA (NOME E PAÍS)");
    const userId = "persistent_user_" + Date.now();

    // TURN 1: Greet and provide Name/Country
    console.log("\n--- TURNO 1: IDENTIFICAÇÃO ---");
    const r1 = await generateResponse(userId, "Hola! Soy Isabella de México.", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${r1}`);

    // Simulate script finishing and reloading (the JSON is already on disk)
    console.log("\n--- TURNO 2: TESTANDO MEMÓRIA (NOME) ---");
    const r2 = await generateResponse(userId, "¿Cómo me llamo?", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${r2}`);

    if (r2.includes("Isabella")) {
        console.log("✅ Memória de NOME: OK");
    } else {
        console.log("❌ Memória de NOME: FALHOU");
    }

    console.log("\n--- TURNO 3: TESTANDO MEMÓRIA (PAÍS/PREÇO) ---");
    const r3 = await generateResponse(userId, "Dime el precio por favor.", SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${r3}`);

    if (r3.includes("MXN") || r3.includes("pesos mexicanos")) {
        console.log("✅ Memória de PAÍS (Preço): OK");
    } else {
        console.log("❌ Memória de PAÍS (Preço): FALHOU");
    }

    console.log("\n--- FIM DO TESTE ---");
}

testMemoryPersistence();
