const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// MOCK the dependencies to isolate server logic
// We need to partially mock server.js or copy the logic to test it in isolation
// easier to copy the logic into a test harness since server.js isn't exported as a module easily (app.listen)

// Mock aiService
const mockGenerateResponse = jest.fn().mockImplementation((id, msg) => Promise.resolve(`AI Response to: ${msg}`));
const mockSetCustomField = jest.fn().mockResolvedValue(true);

jest.mock('./src/services/aiService', () => ({
    generateResponse: mockGenerateResponse
}));
jest.mock('./src/services/manychatService', () => ({
    setCustomFieldByName: mockSetCustomField
}));

// We will implement a simplified version of the server logic here to demonstrate the flaw
// because modifying the actual server.js to export the app for testing might be invasive right now
// logic copied from src/server.js lines 50-120

const userLastResponse = new Map(); // THE IN-MEMORY STORAGE (The culprit)

const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    try {
        const data = req.body;
        if (!data.user_id) return res.status(400).json({ error: 'Missing user_id' });

        const userId = data.user_id;
        const userMessage = data.message || data.last_input_text || "Olá";

        // REPLICATING SERVER.JS LOGIC
        const lastSent = userLastResponse.get(userId);
        if (lastSent) {
            const cleanInput = userMessage.trim().toLowerCase();
            const cleanLast = lastSent.trim().toLowerCase();
            if (cleanInput === cleanLast || (cleanInput.length > 5 && cleanLast.includes(cleanInput))) {
                console.log(`🔁 ECHO DETECTED for ${userId}. Ignoring.`);
                return res.status(200).json({ status: 'ignored_echo' });
            }
        }

        const aiResponse = await mockGenerateResponse(userId, userMessage);

        // UPDATE MEMORY
        userLastResponse.set(userId, aiResponse);

        res.status(200).json({ ai_reply: aiResponse });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

describe('Echo Bug with Server Restart', () => {
    const userId = "user123";

    test('Scenario: Server Restart causes Echo', async () => {
        // 1. User sends message
        let res = await request(app).post('/webhook').send({ user_id: userId, message: "Hello" });
        expect(res.body.ai_reply).toContain("AI Response to: Hello");
        const botResponse = res.body.ai_reply;

        // 2. Immediate webhook trigger with Bot's response (Echo) - Should be IGNORED
        res = await request(app).post('/webhook').send({ user_id: userId, message: botResponse });
        expect(res.body.status).toBe('ignored_echo');

        // 3. SIMULATE SERVER RESTART by clearing the memory
        userLastResponse.clear();
        console.log("--- SIMULATING SERVER RESTART (Memory Wipe) ---");

        // 4. Webhook triggers again (e.g. delayed retry or another update) with SAME Bot response
        // In real life, this is the webhook for the bot's own message update arriving after restart
        res = await request(app).post('/webhook').send({ user_id: userId, message: botResponse });

        // BUG: It should be ignored, but it will be processed!
        if (res.body.status === 'ignored_echo') {
            console.log("✅ PASSED: Echo persisted across restart (unexpected with in-memory atm)");
        } else {
            console.log("❌ FAILED: Replica of bug! Bot replied to itself after restart.");
        }

        expect(res.body.status).toBe('ignored_echo'); // THIS WILL FAIL
    });
});
