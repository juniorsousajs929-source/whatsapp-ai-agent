const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function testMargaritaFlow() {
    console.log("Starting test for Margarita Flow (Handling complex first message)...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            temperature: 0.9
        }
    });

    const history = [];
    const chat = model.startChat({ history });

    // Step 1
    const msg1 = "Soy margarita Isidro de México solo Que quiero que hablemos mañana después de las 12";
    console.log(`\nSENDING 1: "${msg1}"`);
    let result = await chat.sendMessage(msg1);
    console.log("\n--- AI RESPONSE 1 ---");
    console.log(result.response.text());

    // Step 2
    const msg2 = "Ya que tengo visita";
    console.log(`\nSENDING 2: "${msg2}"`);
    result = await chat.sendMessage(msg2);
    console.log("\n--- AI RESPONSE 2 ---");
    console.log(result.response.text());

    // Step 3
    const msg3 = "Espero su comprensión";
    console.log(`\nSENDING 3: "${msg3}"`);
    result = await chat.sendMessage(msg3);
    console.log("\n--- AI RESPONSE 3 ---");
    console.log(result.response.text());
    console.log("-------------------");
}

testMargaritaFlow();
