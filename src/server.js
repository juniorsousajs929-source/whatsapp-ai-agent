const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const { generateResponse } = require('./services/aiService');
const { setCustomFieldByName } = require('./services/manychatService');
const dbService = require('./services/dbService'); // MongoDB Integration
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
const WHATSAPP_LINKS = [
    // "https://wa.me/message/BJNHQE5KTTITE1", // Link 1 (Zap 1) - BANNED 🚫
    // "https://wa.me/message/4WCL3T3HBGMOP1", // Link 3 (Zap 3 - Novo) - BANNED 🚫
    // "https://wa.me/message/QLDVM3R4XTKBC1", // Link 4 (Zap 4 - Ativo) ✅
    "https://wa.me/message/VMP76GNIJYV4B1", // Link 5 (Zap 5 - Ativo) ✅
    // "https://wa.me/message/KU7GZNBQZKPRN1", // Link 6 (Novo) ✅
    // Link 2 (JNATJ1) REMOVED due to Ban 🚫
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

// ANTI-ECHO GUARD STORAGE (In-Memory Fallback)
// Stores: { userId: "Last Response Text" }
const userLastResponse = new Map();

// Load from file if exists (Persistence across restarts - Fallback)
if (fs.existsSync('echo_guard.json')) {
    try {
        const data = fs.readFileSync('echo_guard.json');
        const json = JSON.parse(data);
        for (const [key, value] of Object.entries(json)) {
            userLastResponse.set(key, value);
        }
        console.log("🛡️ Local Anti-Echo Guard loaded from disk (Fallback).");
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

// BOT ID MAPPING STORAGE (Persist bot_id per userId - Fallback)
const userBotMap = new Map();

if (fs.existsSync('data/user_bot_map.json')) {
    try {
        const data = fs.readFileSync('data/user_bot_map.json');
        const json = JSON.parse(data);
        for (const [key, value] of Object.entries(json)) {
            userBotMap.set(key, value);
        }
        console.log("🤖 Local userBotMap loaded from disk (Fallback).");
    } catch (e) {
        console.error("Failed to load userBotMap:", e);
    }
}

function saveUserBotMap() {
    try {
        if (!fs.existsSync('data')) fs.mkdirSync('data');
        const obj = Object.fromEntries(userBotMap);
        fs.writeFileSync('data/user_bot_map.json', JSON.stringify(obj));
    } catch (e) {
        console.error("Failed to save userBotMap:", e);
    }
}

// MESSAGE BUFFER STORAGE (Anti-Spam / Debounce)
// Stores: { userId: { messages: [], botId:Str, timer: Timeout } }
const messageBuffers = {};

// PROCESSED MESSAGES CACHE (Deduplicate ManyChat Retries)
// Stores: { userId: { lastMessage: "text", timestamp: 123456 } }
const processedMessagesCache = {};

// CONCURRENCY LOCKS (Prevent MongoDB Race Conditions & AI Double Replies)
// Stores: { userId: Promise }
const userLocks = new Map();

async function processAIContext(userId, userMessage, botId = 'default') {
    // 1. Get current lock for user or a resolved promise
    let currentLock = userLocks.get(userId) || Promise.resolve();

    // 2. Create a new lock resolver
    let releaseLock;
    const nextLock = new Promise(resolve => { releaseLock = resolve; });

    // 3. Chain this execution AFTER the current lock finishes
    userLocks.set(userId, currentLock.then(async () => {
        try {
            await doProcessAIContext(userId, userMessage, botId);
        } finally {
            releaseLock(); // 4. Release lock for next task
        }
    }));
}

async function doProcessAIContext(userId, userMessage, botId) {
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

        // --- 3. ANTI-ECHO GUARD (Server-Side Early Check) MONGODB OR LOCAL ---
        let lastOutput = "";
        if (dbService.status()) {
            lastOutput = (await dbService.getEchoGuard(userId) || "").toLowerCase().trim();
        } else {
            lastOutput = (userLastResponse.get(userId) || "").toLowerCase().trim();
        }

        const currentInput = userMessage.toLowerCase().trim();

        if (lastOutput === currentInput && currentInput !== "") {
            console.warn(`🛡️ ANTI-ECHO: Blocked loop for ${userId}. Input matches last output (normalized).`);
            return;
        }

        // Special case: ManyChat sometimes sends the exact same message twice if the server is slow.
        // If the current aggregated input is exactly equal to the last output (even after trimming and case normalization),
        // we skip it to prevent an infinite feedback loop.

        // --- 4. GENERATE AI RESPONSE (Hydra Mode) ---
        const aiResponse = await generateResponse(userId, userMessage, SYSTEM_INSTRUCTION, botId);

        // Save this response to prevent future echoes (MONGODB OR LOCAL)
        if (dbService.status()) {
            await dbService.saveEchoGuard(userId, aiResponse);
        } else {
            userLastResponse.set(userId, aiResponse);
            saveUserLastResponse(); // Persist the change
        }

        console.log(`🤖 AI Reply to ${userId}: "${aiResponse}"`);

        // --- 5. SEND TO MANYCHAT ---
        // Update Custom Field 'teste_robo'
        await setCustomFieldByName(userId, 'teste_robo', aiResponse, botId);

    } catch (error) {
        console.error(`❌ ERROR processing context for ${userId}:`, error.message);
    }
}

app.post('/webhook', async (req, res) => {
    const { user_id, message } = req.body;

    // 1. Validate Input
    if (!user_id || !message) {
        return res.status(400).json({ error: 'Missing user_id or message' });
    }

    const userId = user_id.toString();
    const incomingMsg = message.toString();

    // 1.2 Global Deduplication for ManyChat Retries (60 seconds window)
    const now = Date.now();
    if (processedMessagesCache[userId]) {
        const cache = processedMessagesCache[userId];
        if (cache.lastMessage === incomingMsg && (now - cache.timestamp) < 60000) {
            console.log(`♻️ GLOBAL DEDUPLICATION: Ignoring ManyChat retry for ${userId}: "${incomingMsg}"`);
            return res.status(200).json({ status: 'ignored', message: 'Duplicate message retry detected.' });
        }
    }
    // Update cache
    processedMessagesCache[userId] = { lastMessage: incomingMsg, timestamp: now };

    // 1.5 Determine Bot ID (Fallback to Memory if Missing)
    let bot_id = req.query.bot_id;
    if (!bot_id || bot_id === 'default') {
        if (dbService.status()) {
            bot_id = await dbService.getBotMap(userId) || 'default';
        } else {
            bot_id = userBotMap.get(userId) || 'default';
        }
    } else {
        if (dbService.status()) {
            await dbService.saveBotMap(userId, bot_id);
        } else {
            userBotMap.set(userId, bot_id);
            saveUserBotMap();
        }
    }

    console.log(`📩 [${bot_id}] Received chunk from ${userId}: "${incomingMsg}"`);

    // 2. Initialize Buffer if needed
    if (!messageBuffers[userId]) {
        messageBuffers[userId] = {
            messages: [],
            botId: bot_id,
            timer: null
        };
    }

    // 3. Deduplication (Avoid ManyChat webhook retries or double triggers)
    if (messageBuffers[userId].messages.includes(incomingMsg)) {
        // If the exact same message is already in the buffer, ignore it to prevent aggregation duplication
        console.log(`♻️ DEDUPLICATION: Ignoring duplicate message chunk for ${userId}: "${incomingMsg}"`);
        return res.status(200).json({ status: 'ignored', message: 'Duplicate chunk detected.' });
    }

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
    const bot_id = req.query.bot_id || 'default';

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

app.listen(PORT, async () => {
    await dbService.connectDB(); // Attempt to connect to DB at startup
    console.log(`Server is running on port ${PORT}`);
    keepAlive(); // Start the heart
});
