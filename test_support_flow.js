const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt.js');
require('dotenv').config();

async function testPostPurchase() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: SYSTEM_INSTRUCTION });

    // Simulating context where user has heard the price and is now saying "ya pague"
    const history = [
        {
            role: "user",
            parts: [{ text: "Hola soy Maria de Ecuador" }]
        },
        {
            role: "model",
            parts: [{ text: "PAGO ÚNICO - SIN MENSUALIDADES. (Pago en tu moneda local). Aceptamos TARJETA DE CRÉDITO, DÉBITO, PAYPAL Y EFECTIVO en algunos países. $34.97 USD. https://go.hotmart.com/O103265408E" }]
        }
    ];

    const chat = model.startChat({ history });

    console.log("SENDING: dra, ya te hice el pago, de hecho te mandé el comprobante arriba. cómo accedo a las recetas?");
    const result = await chat.sendMessage("dra, ya te hice el pago, de hecho te mandé el comprobante arriba. cómo accedo a las recetas?");

    console.log("\n--- AI RESPONSE ---");
    console.log(result.response.text());
    console.log("-------------------");
}

testPostPurchase();
