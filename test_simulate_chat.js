const axios = require('axios');

const BASE_URL = 'https://manychat-ai-agent.onrender.com';
// const BASE_URL = 'http://localhost:3000'; // For Local Test

async function simulateChat(botId, userName, userCountry) {
    console.log(`\n🤖 === SIMULANDO CONVERSA NO ${botId.toUpperCase()} ===`);
    const userId = `test_user_${botId}_${Date.now()}`;

    // TURN 1: User says Hello
    console.log(`\n👤 User: Hola!`);
    await sendMessage(botId, userId, "Hola!");

    await wait(10000);

    // TURN 2: User says Name/Country
    console.log(`\n👤 User: Soy ${userName} de ${userCountry}`);
    await sendMessage(botId, userId, `Soy ${userName} de ${userCountry}`);

    await wait(2000);

    // TURN 3: User says Goal
    console.log(`\n👤 User: Quiero bajar 10kg`);
    await sendMessage(botId, userId, "Quiero bajar 10kg");
}

async function sendMessage(botId, userId, text) {
    try {
        const res = await axios.post(`${BASE_URL}/webhook?bot_id=${botId}`, {
            user_id: userId,
            message: text
        });

        let reply = res.data.ai_reply || "NO REPLY";

        // EMOJI CHECK 🕵️‍♂️
        const hasEmoji = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{2600}-\u{26FF}]/u.test(reply);
        const statusEmoji = hasEmoji ? "❌ EMOJI DETECTADO!" : "✅ CLEAN (Zero Emojis)";

        console.log(`🤖 AI: ${reply}`);
        console.log(`🔍 Audit: ${statusEmoji}`);

    } catch (e) {
        console.error(`❌ Error sending message:`, e.message);
    }
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    await simulateChat('zap4', 'Ana', 'Mexico');
    await simulateChat('zap5', 'Carla', 'Colombia');
}

run();
