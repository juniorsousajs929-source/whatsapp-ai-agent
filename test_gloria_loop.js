const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function reproduceGloriaLoop() {
    console.log("🚀 STARTING GLORIA LOOP SIMULATION\n");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            temperature: 0.8
        }
    });

    const history = [];
    const chat = model.startChat({ history });

    const turns = [
        "Hola! quiero info de la dieta", // User initial contact
        "Gloria España",                 // User gives name and country directly
        "Otra vez?",                     // User gets frustrated at repeated greeting
        "Gloria. Esoaña.",               // User tries typing it again
    ];

    for (let i = 0; i < turns.length; i++) {
        const msg = turns[i];
        console.log(`\n============================`);
        console.log(`👤 USER: "${msg}"`);
        console.log(`============================`);

        const result = await chat.sendMessage(msg);
        console.log(`\n🤖 AI RESPONSE:\n${result.response.text()}\n`);

        // Anti-api limit wait
        await new Promise(r => setTimeout(r, 2000));
    }
}

reproduceGloriaLoop();
