const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function testAmnesia() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash", 
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            temperature: 0.8
        }
    });

    const chat = model.startChat({ history: [] }); // Empty history -> Amnesia
    const result = await chat.sendMessage("Gloria España");
    console.log(`🤖 AI RESPONSE:\n${result.response.text()}\n`);
}
testAmnesia();
