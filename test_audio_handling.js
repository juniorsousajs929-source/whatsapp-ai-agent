const { generateResponse } = require('./src/services/aiService');
const { SYSTEM_INSTRUCTION } = require('./src/config/prompt');

async function testAudio() {
    console.log("Testing Audio Input (URL)...");
    try {
        const response = await generateResponse("test_user_123", "https://manychat.com/audio_file.mp3", SYSTEM_INSTRUCTION);
        console.log("Response:", response);
    } catch (error) {
        console.error("CRASH DETECTED:", error);
    }
}

testAudio();
