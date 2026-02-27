const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Carrega a primeira chave da variável GEMINI_KEYS
const keys = process.env.GEMINI_KEYS.split(',');
const genAI = new GoogleGenerativeAI(keys[3] || keys[0]);

async function listModels() {
    try {
        console.log("Fetching available models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keys[3] || keys[0]}`);
        const data = await response.json();
        const models = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        console.log("Available models for generateContent:");
        models.forEach(m => console.log(`- ${m.name} (${m.version})`));
    } catch (e) {
        console.error("Failed to list models:", e);
    }
}

listModels();
