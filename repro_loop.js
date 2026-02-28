const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');
require('dotenv').config();

async function runTest() {
    const userId = "test_loop_user_" + Date.now();
    console.log(`🎬 STARTING CONVERSATION TEST [User: ${userId}]`);

    const flow = [
        "Hola! quiero info de la dieta",
        "Necesito orientación para bajar el abdomen", // Should trigger Step 2 (Name)
        "90 kg Quiero bajar a 80kg", // Should trigger Step 4 (Weight/Goal) but might loop Step 2
        "Mido 5' 7\"" // Should trigger Step 5/6
    ];

    for (let i = 0; i < flow.length; i++) {
        const msg = flow[i];
        console.log(`\n👤 User: "${msg}"`);
        try {
            const reply = await generateResponse(userId, msg, SYSTEM_INSTRUCTION);
            console.log(`🤖 Bot: "${reply}"`);

            // Check for loop trigger
            if (reply.includes("Encantada de conocerte") && i > 1) {
                console.error("🚨 LOOP DETECTED! Bot repeated greeting unexpectedly.");
            }
        } catch (e) {
            console.error("❌ Error:", e.message);
        }
    }
}

runTest();
