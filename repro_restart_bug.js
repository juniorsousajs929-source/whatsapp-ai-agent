const fs = require('fs');

// REPRODUCTION SCRIPT FOR ECHO BUG
// Simulates Server Logic without starting a full server

// 1. MOCK STATE (In-Memory)
let userLastResponse = new Map();

// 2. MOCK PROCESS FUNCTION (The logic from server.js)
async function processWebhook(data) {
    const userId = data.user_id;
    const userMessage = data.message || "Olá";

    console.log(`\n[SERVER] Processing message from ${userId}: "${userMessage}"`);

    // ECHO CHECK
    const lastSent = userLastResponse.get(userId);
    if (lastSent) {
        const cleanInput = userMessage.trim().toLowerCase();
        const cleanLast = lastSent.trim().toLowerCase();

        // Strict Anti-Loop (Same as server.js)
        if (cleanInput === cleanLast || (cleanInput.length > 5 && cleanLast.includes(cleanInput))) {
            console.log(`✅ ECHO DETECTED for ${userId}. Ignoring input.`);
            return { status: 'ignored_echo' };
        }
    } else {
        console.log(`[DEBUG] No last response found in memory for ${userId}. Treated as new input.`);
    }

    // GENERATE RESPONSE (Mock)
    const aiResponse = `AI Response to: ${userMessage}`;
    console.log(`[AI] Generated: "${aiResponse}"`);

    // UPDATE MEMORY
    userLastResponse.set(userId, aiResponse);
    console.log(`[MEMORY] Updated userLastResponse for ${userId}.`);

    return { status: 'success', ai_reply: aiResponse };
}

// 3. RUN SCENARIO
async function runTest() {
    const userId = "test_user_123";

    console.log("=== STEP 1: User sends 'Hello' ===");
    await processWebhook({ user_id: userId, message: "Hello" });

    // Check Memory
    if (!userLastResponse.has(userId)) {
        console.error("❌ ERROR: Memory failed to update.");
        return;
    }

    console.log("\n=== STEP 2: Webhook triggers with BOT RESPONSE (Echo) ===");
    const botResponse = userLastResponse.get(userId);
    const res2 = await processWebhook({ user_id: userId, message: botResponse });

    if (res2.status === 'ignored_echo') {
        console.log("✅ PASSED: Echo correctly ignored.");
    } else {
        console.error("❌ FAILED: Echo was NOT ignored!");
    }

    console.log("\n=== STEP 3: SERVER RESTART (Memory Wipe) ===");
    userLastResponse = new Map(); // CLEAR MEMORY
    console.log("⚠️ Memory Cleared.");

    console.log("\n=== STEP 4: Webhook triggers AGAIN with BOT RESPONSE (Delayed/Retry) ===");
    // This happens if ManyChat echoes the bot response, and the server had restarted in between.
    const res3 = await processWebhook({ user_id: userId, message: botResponse });

    if (res3.status === 'ignored_echo') {
        console.log("✅ PASSED: Echo persisted across restart.");
    } else {
        console.log("❌ FAILED: Bot replied to itself! (BUG CONFIRMED)");
        console.log("   Reason: Server forgot what it last said.");
    }
}

runTest();
