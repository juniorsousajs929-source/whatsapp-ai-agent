const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function testVeronica() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    
    // Test with the backend's current temperature (1.0 or 0.8)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: SYSTEM_INSTRUCTION, generationConfig: { temperature: 1.0 } });

    for(let i=0; i<3; i++) {
        const chat = model.startChat({ 
            history: [
                { role: "user", parts: [{ text: "Hola! quiero info de la dieta" }] },
                { role: "model", parts: [{ text: "Hola, ¿cómo estás? Soy la Dra. Adriele Cunha, especialista en nutrición y pérdida de peso. ¡Sea muy bienvenida al proyecto D22! Te estaré explicando todo sobre la limpieza orgánica corporal y el método para perder medidas en la primera semana con el Reto de 8 Días. ¿Cómo te llamas y desde qué país nos escribes?" }] }
            ]
        });
        const res = await chat.sendMessage("Verónica Bejarano De España...Barcelona\nGracias por los consejos");
        console.log(`\n--- ATTEMPT ${i+1} ---`);
        console.log(res.response.text());
        await new Promise(r => setTimeout(r, 1000));
    }
}

testVeronica();
