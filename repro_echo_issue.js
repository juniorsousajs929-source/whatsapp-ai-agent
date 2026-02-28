const axios = require('axios');

async function repro() {
    const userId = "test_user_" + Date.now();
    const webhookUrl = "http://localhost:3000/webhook";

    console.log("🚀 Starting reproduction of Echo Issue...");

    // 1. Send first message
    console.log("\n1. Sending initial user message...");
    await axios.post(webhookUrl, { user_id: userId, message: "Hola, quiero info" });

    // Wait for AI to process (buffer is 7s, so wait 10s)
    console.log("Waiting 10s for AI to respond...");
    await new Promise(r => setTimeout(r, 10000));

    // 2. Simulate ManyChat sending back the AI output as "input"
    // This is the normalized text from the previous run
    const aiResponseProduced = "Hola, ¿cómo estás? Soy la Dra. Adriele Cunha, especialista en nutrición y pérdida de peso. ¡Sea muy bienvenida al proyecto D22! Te estaré explicando todo sobre la limpieza orgánica corporal y el método para perder medidas en la primera semana con el Reto de 8 Días. ¿Cómo te llamas y desde qué país nos escribes?";

    console.log("\n2. Simulating Echo (ManyChat sending back AI output)...");
    await axios.post(webhookUrl, { user_id: userId, message: aiResponseProduced });

    // 3. Simulate Duplicate Chunk (ManyChat retry)
    console.log("\n3. Sending duplicate chunk (testing deduplication)...");
    await axios.post(webhookUrl, { user_id: userId, message: "Bogotá" });
    await axios.post(webhookUrl, { user_id: userId, message: "Bogotá" }); // Duplicate

    console.log("\nCheck the server logs for '🛡️ ANTI-ECHO: Blocked loop' and '♻️ DEDUPLICATION: Ignoring duplicate'.");
}

repro().catch(console.error);
