const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_KEY_1 || process.env.GEMINI_KEY_2;
const genAI = new GoogleGenerativeAI(apiKey);

async function testSingleModel() {
    const modelName = "gemini-flash-latest"; // The one we saw in the list
    console.log(`Trying model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say Hello");
        const text = result.response.text();
        console.log(`✅ SUCCESS! ${modelName} replied: "${text.trim()}"`);
    } catch (error) {
        console.error(`❌ FAILURE: ${modelName} - ${error.message}`);
    }
}

testSingleModel();
