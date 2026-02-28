const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function runTest() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: SYSTEM_INSTRUCTION, generationConfig: { temperature: 0.8 } });
    const chat = model.startChat({ history: [] });
    // Test what Gemini says if the first thing it ever hears is "Gloria España"
    let res = await chat.sendMessage("Gloria España");
    console.log("RESPONSE TO 'Gloria España' (NO HISTORY):\n", res.response.text());

    // Test what Gemini says if the first thing it hears is "Otra vez?"
    const chat2 = model.startChat({ history: [] });
    res = await chat2.sendMessage("Otra vez?");
    console.log("\nRESPONSE TO 'Otra vez?' (NO HISTORY):\n", res.response.text());
}
runTest();
