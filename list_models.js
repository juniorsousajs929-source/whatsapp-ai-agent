const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_KEY_1 || process.env.GEMINI_KEY_2;

if (!apiKey) {
    console.error("No API key found!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Fetching available models...");
        // Usually, getGenerativeModel returns a list if you check capabilities
        // But the SDK doesn't expose listModels cleanly in v0.x sometimes.
        // Let's rely on trying a few common ones.

        const modelsToTest = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.0-pro",
            "gemini-pro",
            "gemini-flash"
        ];

        for (const modelName of modelsToTest) {
            console.log(`Testing model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                console.log(`✅ Success: ${modelName} works!`);
            } catch (error) {
                console.error(`❌ Failed: ${modelName} - ${error.message}`);
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

listModels();
