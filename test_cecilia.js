const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function testCecilia() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: SYSTEM_INSTRUCTION, generationConfig: { temperature: 0.8 } });

    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: "Hola! quiero info de la dieta\nSoy Cecilia de Uruguay\nUn placer!" }] },
            { role: "model", parts: [{ text: "El placer es mío, Cecilia. Para poder ayudarte de la mejor manera, cuéntame un poco más: ¿Cuántos kilos pesas en este momento? ¿Y cuántos kilos te gustaría perder?" }] }
        ]
    });

    // Test the exact message string that failed
    try {
        const msg = "Estaba en 59 estaba tomando unas píldoras q se debían naturales pero eran anfetaminas y las dejé \n Me inflamo no es tanto el peso \n Ahora debo estar en 61 algo así \n Mido 1,65 \n Hago gimnasia todos los días \n Tengo 52 años \n Quiero dejar de hincharme \n Más que nada \n Pero si bajo a 59…58 me hace sentir mejor";
        console.log("SENDING:", msg);
        const res = await chat.sendMessage(msg);
        console.log("RESPONSE:\n", res.response.text());
    } catch (e) {
        console.error("ERROR CAUGHT:", e);
    }
}

testCecilia();
