const axios = require('axios');

async function testEchoOnly() {
    const userId = "echo_test_" + Date.now();
    const webhookUrl = "http://localhost:3000/webhook";

    console.log("1. Sending initial message...");
    await axios.post(webhookUrl, { user_id: userId, message: "Hola" });

    console.log("Waiting 10s for AI...");
    await new Promise(r => setTimeout(r, 10000));

    // Guessing the AI response based on previous logs (Dra. Adriele intro)
    const echoMsg = "Hola, ¿cómo estás? Soy la Dra. Adriele Cunha, especialista en nutrición y pérdida de peso. ¡Sea muy bienvenida al proyecto D22! Te estaré explicando todo sobre la limpieza orgánica corporal y el método para perder medidas en la primera semana con el Reto de 8 Días. ¿Cómo te llamas y desde qué país nos escribes?";

    console.log("2. Sending EXACT echo...");
    await axios.post(webhookUrl, { user_id: userId, message: echoMsg });

    console.log("Wait for server processing (7s buffer + processing)...");
    await new Promise(r => setTimeout(r, 10000));
}

testEchoOnly().catch(console.error);
