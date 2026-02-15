const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function testHumanization() {
    console.log("=== TESTE DE HUMANIZAÇÃO E ANTIRREPETIÇÃO ===");
    const userId = "test_user_" + Date.now();

    // 1. User provides name, country and weight in the first message
    const input1 = "Hola! Soy Maria de Chile y peso 85kg. Quiero bajar de peso.";
    console.log(`\n👤 USER: ${input1}`);
    const res1 = await generateResponse(userId, input1, SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${res1}`);

    // Check if AI asked for name, country or weight
    if (res1.toLowerCase().includes("cómo te llamas") || res1.toLowerCase().includes("qué país") || res1.toLowerCase().includes("cuánto pesas")) {
        console.log("\n❌ FAILED: AI asked for information already provided.");
    } else {
        console.log("\n✅ SUCCESS: AI skipped redundant questions.");
    }

    // 2. User responds with difficulty
    const input2 = "Mi mayor problema es que como por ansiedad en la noche.";
    console.log(`\n👤 USER: ${input2}`);
    const res2 = await generateResponse(userId, input2, SYSTEM_INSTRUCTION);
    console.log(`🤖 AI: ${res2}`);

    // Check for variety in sentence starters
    console.log("\n(Verifique visualmente se a IA variou as frases e não pareceu mecânica)");
}

testHumanization();
