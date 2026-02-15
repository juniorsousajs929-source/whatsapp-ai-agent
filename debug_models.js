const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GEMINI_KEY_1 || process.env.GEMINI_KEY_2;

if (!apiKey) {
    console.error("No API key found!");
    process.exit(1);
}

const LIST_MODELS_URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function debugModels() {
    try {
        console.log(`Getting models list from: ${LIST_MODELS_URL.replace(apiKey, "HIDDEN")}`);
        const response = await axios.get(LIST_MODELS_URL);

        console.log("✅ Models found:", response.data.models.map(m => m.name));

        // Find Gemini models specifically
        const geminiModels = response.data.models.filter(m => m.name.includes("gemini"));
        console.log("\n🧪 Possible Candidates:");
        geminiModels.forEach(m => console.log(`- ${m.name} (${m.description.substring(0, 50)}...)`));

    } catch (error) {
        console.error("❌ Failed to list models:", error.response ? error.response.data : error.message);
    }
}

debugModels();
