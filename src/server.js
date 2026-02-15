const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const { generateResponse } = require('./services/aiService');
const { setCustomFieldByName } = require('./services/manychatService');
const { SYSTEM_INSTRUCTION } = require('./config/prompt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve Verification Site (Force Deploy)

// Helper for human-like delay
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Basic health check (now serves index.html if exists, or this message)
app.get('/health', (req, res) => {
    res.send('ManyChat AI Agent is running!');
});

// Webhook endpoint for ManyChat
// HYDRA ROTATOR - Traffic Distributor 🐍🔀
// Rotates traffic between multiple WhatsApp numbers to avoid bans
// PLACEHOLDERS FOR PARTNER - REPLACE WITH YOUR OWN LINKS
const WHATSAPP_LINKS = [
    "https://wa.me/message/QANEQB7H2EWQI1"
];

app.get('/rotator', (req, res) => {
    // FALLBACK SAFETY: If no links, redirect to Safe Page (Google/Instagram)
    if (WHATSAPP_LINKS.length === 0) {
        return res.redirect('https://www.instagram.com'); // Park traffic safely
    }

    // Pick a random link
    const randomLink = WHATSAPP_LINKS[Math.floor(Math.random() * WHATSAPP_LINKS.length)];
    // Redirect the user
    res.redirect(randomLink);
});

// ANTI-ECHO GUARD STORAGE (In-Memory)
// Stores: { userId: "Last Response Text" }
const userLastResponse = new Map();

// Load from file if exists (Persistence across restarts)
if (fs.existsSync('echo_guard.json')) {
    try {
        const data = fs.readFileSync('echo_guard.json');
        const json = JSON.parse(data);
        for (const [key, value] of Object.entries(json)) {
            userLastResponse.set(key, value);
        }
        console.log("🛡️ Anti-Echo Guard loaded from disk.");
    } catch (e) {
        console.error("Failed to load echo guard:", e);
    }
}

// Function to save guard to disk
function saveUserLastResponse() {
    try {
        const obj = Object.fromEntries(userLastResponse);
        fs.writeFileSync('echo_guard.json', JSON.stringify(obj));
    } catch (e) {
        console.error("Failed to save echo guard:", e);
    }
}

// MESSAGE BUFFER STORAGE (Anti-Spam / Debounce)
// Stores: { userId: { messages: [], botId:Str, timer: Timeout } }
const messageBuffers = {};

async function processAIContext(userId, userMessage, botId) {
    try {
        console.log(`\n🧠 [${botId}] Processing Aggregated Context for ${userId}: "${userMessage}"`);

        // --- 1. OPT-OUT CHECK (STOP) ---
        const stopKeywords = ['stop', 'parar', 'sair', 'cancelar', 'basta', 'no mas', 'no más'];
        if (stopKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
            console.log(`🛑 OPT-OUT DETECTED for ${userId}. Halting AI.`);
            await setCustomFieldByName(userId, "teste_robo", "", botId); // Clear output
            return;
        }

        // --- 2. DIAGNOSTIC COMMAND (Secret) ---
        if (userMessage.trim() === "STATUS_REPORT_NOW") {
            const uptime = process.uptime();
            const memoryUsage = process.memoryUsage();
            const stats = `📊 SERVER STATUS:\n` +
                `- Uptime: ${Math.floor(uptime)} seconds\n` +
                `- Configured Bot: ${botId}\n` +
                `- Memory (RSS): ${Math.floor(memoryUsage.rss / 1024 / 1024)} MB\n` +
                `- User ID: ${userId}`;

            await setCustomFieldByName(userId, "teste_robo", stats, botId);
            return;
        }

        // --- 3. GENERATE AI RESPONSE (Hydra Mode) ---
        const aiResponse = await generateResponse(userId, userMessage, SYSTEM_INSTRUCTION, botId);

        // --- 4. ANTI-ECHO GUARD (Server-Side Final Check) ---
        // Prevents loop if ManyChat sends back the AI response as user input
        if (userLastResponse.get(userId) === userMessage) {
            console.warn(`🛡️ ANTI-ECHO: Blocked loop for ${userId}. Input matches last output.`);
            return;
        }

        // Save this response to prevent future echoes
        userLastResponse.set(userId, aiResponse);
        saveUserLastResponse(); // Persist the change

        console.log(`🤖 AI Reply to ${userId}: "${aiResponse}"`);

        // --- 5. SEND TO MANYCHAT ---
        // Update Custom Field 'teste_robo'
        await setCustomFieldByName(userId, 'teste_robo', aiResponse, botId);

    } catch (error) {
        console.error(`❌ ERROR processing context for ${userId}:`, error.message);
    }
}

app.post('/webhook', (req, res) => {
    const { user_id, message } = req.body;
    const bot_id = req.query.bot_id || 'default_bot';

    // 1. Validate Input
    if (!user_id || !message) {
        return res.status(400).json({ error: 'Missing user_id or message' });
    }

    const userId = user_id.toString();
    const incomingMsg = message.toString();

    console.log(`📩 [${bot_id}] Received chunk from ${userId}: "${incomingMsg}"`);

    // 2. Initialize Buffer if needed
    if (!messageBuffers[userId]) {
        messageBuffers[userId] = {
            messages: [],
            botId: bot_id,
            timer: null
        };
    }

    // 3. Add message to buffer
    messageBuffers[userId].messages.push(incomingMsg);
    messageBuffers[userId].botId = bot_id; // Update bot_id to latest

    // 4. Reset Timer (Debounce)
    if (messageBuffers[userId].timer) {
        clearTimeout(messageBuffers[userId].timer);
    }

    messageBuffers[userId].timer = setTimeout(() => {
        // TIMEOUT REACHED: Process everything
        const finalContext = messageBuffers[userId].messages.join('\n'); // Combine with newlines
        const finalBotId = messageBuffers[userId].botId;

        // Clean up buffer BEFORE processing to allow new messages to start a new buffer
        delete messageBuffers[userId];

        // Trigger AI Background Process
        processAIContext(userId, finalContext, finalBotId);
    }, 7000); // 7 Seconds Wait Time

    // 5. Respond Immediately to ManyChat (Avoid Timeout)
    res.status(200).json({ status: 'buffered', message: 'Message received and buffering.' });
});

// REMARKETING TRIGGER ENDPOINT (Called by ManyChat after 19h Smart Delay)
app.post('/discount_offer', async (req, res) => {
    const { user_id } = req.body;
    const bot_id = req.query.bot_id || 'default_bot';

    if (!user_id) {
        return res.status(400).json({ error: 'Missing user_id' });
    }

    console.log(`🎟️ [${bot_id}] Generating DISCOUNT OFFER for ${user_id}`);

    try {
        // 1. Generate the Special Offer Text (Meta Safe)
        const offerMessage = await generateResponse(
            user_id,
            "GENERATE_DISCOUNT_OFFER_NOW", // Secret Command
            SYSTEM_INSTRUCTION,
            bot_id
        );

        // 2. Send to ManyChat Custom Field
        await setCustomFieldByName(user_id, 'teste_robo', offerMessage, bot_id);

        res.json({ status: 'success', message: 'Discount offer sent.' });
    } catch (error) {
        console.error("❌ Error generating discount:", error);
        res.status(500).json({ error: 'Failed to generate offer' });
    }
});

// KEEP-ALIVE MECHANISM (Self-Ping)
// Pings the server every 10 minutes to prevent Render Free Tier from sleeping
const keepAlive = () => {
    const url = "https://manychat-ai-agent.onrender.com/health";

    // Ping every 10 minutes (600000 ms)
    setInterval(async () => {
        try {
            console.log("⏰ KEEP-ALIVE: Pinging self to stay awake...");
            await axios.get(url);
            console.log("✅ KEEP-ALIVE: Pulse check successful.");
        } catch (error) {
            console.error("⚠️ KEEP-ALIVE: Pulse check failed. Server might be down or waking up.");
        }
    }, 600000);
};

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    keepAlive(); // Start the heart
});
