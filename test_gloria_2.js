const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function testGloria2() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            temperature: 0.8
        }
    });

    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: "Hola! quiero info de la dieta" }] },
            { role: "model", parts: [{ text: "Hola, ¿cómo estás? Soy la Dra. Adriele Cunha, especialista en nutrición y pérdida de peso. ¡Sea muy bienvenida al proyecto D22! Te estaré explicando todo sobre la limpieza orgánica corporal y el método para perder medidas en la primera semana con el Reto de 8 Días. ¿Cómo te llamas y desde qué país nos escribes?" }] }
        ]
    });

    // Simulating ManyChat sending them merged via debounce
    const result = await chat.sendMessage("Gloria\nEspaña");
    console.log(`🤖 AI RESPONSE TO 'Gloria\\nEspaña':\n${result.response.text()}\n`);

    const result2 = await chat.sendMessage("Otra vez?");
    console.log(`🤖 AI RESPONSE TO 'Otra vez?':\n${result2.response.text()}\n`);
}
testGloria2();
