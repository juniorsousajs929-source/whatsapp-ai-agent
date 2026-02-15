const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGeneration() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelsToTest = ["gemini-flash-latest", "gemini-1.5-flash", "gemini-pro"];

    for (const modelName of modelsToTest) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello briefly.");
            console.log(`✅ SUCCESS with ${modelName}:`, result.response.text());
            return; // Stop after first success
        } catch (e) {
            console.log(`❌ FAILED with ${modelName}:`, e.message);
            if (e.response) {
                console.log("Details:", JSON.stringify(e.response, null, 2));
            }
        }
    }
}

testGeneration();
