const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function testNameAndPrice() {
    console.log("Starting test for Name and Local Price strictness...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            temperature: 0.7 // A bit lower to ensure it follows the strict rules clearly
        }
    });

    // Simulate user flow:
    // User already gave name ("Claudia") and country ("Colombia")
    // Now user says: "ok me interesa, cual es el costo?"
    const history = [
        {
            role: "user",
            parts: [{ text: "Hola soy Claudia de Colombia" }]
        },
        {
            role: "model",
            parts: [{ text: "Encantada de conocerte, Claudia. Estamos ayudando a mujeres y hombres a adelgazar por más de 4 años con nuestro protocolo de adelgazamiento. Ya te guardé como Claudia aquí, guarda el mío también como 'Dra. Adriele' para que estemos conectados y siempre me encuentres más rápido, por favor.\n\nAhora cuéntame más sobre ti: ¿Cuántos kilos pesas en este momento? ¿Y cuántos kilos quieres perder?" }]
        },
        {
            role: "user",
            parts: [{ text: "peso 80, quiero bajar 10. me interesa el programa, cual es el precio?" }]
        }
    ];

    const chat = model.startChat({ history });

    console.log("SENDING: peso 80, quiero bajar 10. me interesa el programa, cual es el precio?");
    const result = await chat.sendMessage("peso 80, quiero bajar 10. me interesa el programa, cual es el precio?");

    console.log("\n--- AI RESPONSE 1 ---");
    console.log(result.response.text());
    console.log("-------------------\n");

    console.log("SENDING: si, esta bien. mandame el precio porfa");
    const result2 = await chat.sendMessage("si, esta bien. mandame el precio porfa");

    console.log("\n--- AI RESPONSE 2 ---");
    console.log(result2.response.text());
    console.log("-------------------");

    // Assertions
    const text2 = result2.response.text();
    if (!text2.includes("Claudia")) {
        console.error("❌ FAILURE: AI did not use the name in Response 2.");
    } else {
        console.log("✅ SUCCESS: AI used the name 'Claudia' in Response 2.");
    }

    if (text2.includes("USD") || text2.includes("$34.97")) {
        console.error("❌ FAILURE: AI leaked USD pricing to a Colombian user.");
    } else if (text2.includes("128.600") || text2.includes("COP")) {
        console.log("✅ SUCCESS: AI used local COP pricing.");
    } else {
        console.warn("⚠️ WARNING: Price format might be different or missing.");
    }
}

testNameAndPrice();
