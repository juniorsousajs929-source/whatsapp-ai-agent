const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function testLinkConditional() {
    console.log("🚀 STARTING LINK CONDITIONAL SIMULATION\n");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            temperature: 0.8
        }
    });

    // Preset history to just before the pitch
    const history = [
        { role: "user", parts: [{ text: "Hola soy Julia de Costa Rica. Quiero bajar 10 kilos." }] },
        { role: "model", parts: [{ text: "Encantada de conocerte, Julia. Entiendo que quieras bajar 10 kilos. ¿Tienes alguna dificultad para adelgazar? Ejemplo: ganas de picar, metabolismo lento, falta de tiempo?" }] },
        { role: "user", parts: [{ text: "ansiedad por comer dulces" }] },
        { role: "model", parts: [{ text: "Entiendo, Julia. La ansiedad por los dulces es muy común. Te estaré enviando toda la explicación de nuestro método para ayudarte con eso, lee con calma..." }] },
        { role: "user", parts: [{ text: "ok, mandame la info y el precio" }] }
    ];

    const chat = model.startChat({ history });

    console.log(`\n============================`);
    console.log(`🔷 STEP 1: AI Should Pitch and Show Price, BUT NO LINK`);

    let result = await chat.sendMessage("ok, mandame la info y el precio");
    let text = result.response.text();
    console.log(`\n🤖 AI RESPONSE:\n${text}\n`);

    if (text.includes("go.hotmart.com") || text.includes("link")) {
        console.error("❌ FAILS: AI sent the link before confirmation!");
    } else if (text.includes("CRC") || text.includes("Costa Rica") || text.includes("USD")) {
        console.log("✅ SUCCESS: AI sent the price without the link.");
    }

    console.log(`\n============================`);
    console.log(`🔷 STEP 2: User Confirms Enrollment - AI Should Send Link`);
    console.log(`👤 USER: "Sí, me gustaría inscribirme hoy. manda el link"`);

    result = await chat.sendMessage("Sí, me gustaría inscribirme hoy. manda el link");
    text = result.response.text();
    console.log(`\n🤖 AI RESPONSE:\n${text}\n`);

    if (text.includes("go.hotmart.com") || text.includes("O103265408E")) {
        console.log("✅ SUCCESS: AI sent the link after confirmation.");
    } else {
        console.error("❌ FAILS: AI did not send the link when requested!");
    }
}

testLinkConditional();
