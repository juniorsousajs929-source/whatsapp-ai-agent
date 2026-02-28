const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

const HISTORY_FILE = 'data/test_history.json';

async function testHistory() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY_1);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let history = [];
    if (fs.existsSync(HISTORY_FILE)) {
        history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        console.log("Loaded history size: ", history.length);
    }

    const chat = model.startChat({ history });

    try {
        const result = await chat.sendMessage("Hola, soy test.");
        console.log("Bot says:", result.response.text());

        const newHistory = await chat.getHistory();
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(newHistory, null, 2));
        console.log("Saved history size: ", newHistory.length);
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testHistory();
