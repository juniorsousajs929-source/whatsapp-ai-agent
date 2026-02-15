const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// MOCK Gemini to force an ECHO response
jest.mock("@google/generative-ai");

// Manually mocking for this script without Jest
const originalGenAI = require("@google/generative-ai");
originalGenAI.GoogleGenerativeAI.prototype.getGenerativeModel = () => ({
    startChat: () => ({
        sendMessage: async (msg) => ({
            response: {
                text: () => msg // EVIL AI: Repeats exactly what user said
            }
        }),
        getHistory: async () => []
    })
});

async function testEcho() {
    console.log("--- Testing Anti-Echo Safeguard ---");
    const userInput = "Quero perder 5kg";

    console.log(`🔴 User: "${userInput}"`);
    console.log("🤖 AI (Hallucinating): repeats input...");

    const response = await generateResponse("user_test", userInput, SYSTEM_INSTRUCTION);

    console.log(`🟢 System Filtered Response: "${response}"`);

    if (response === userInput) {
        console.error("❌ FAILED: System allowed the echo!");
    } else if (response.includes("Entendi, perfeita colocação")) {
        console.log("✅ PASSED: System intercepted the echo and swtiched to safe question.");
    } else {
        console.log("❓ RESULT: ", response);
    }
}

testEcho();
