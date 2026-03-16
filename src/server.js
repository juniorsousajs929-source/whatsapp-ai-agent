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
    "https://wa.me/message/MZBE3DUUQAXUI1" // Link Oficial do Cliente
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

// CONCURRENCY QUEUE (Strict FIFO processing per user)
const userQueues = new Map();
const userProcessingFlags = new Map();

async function processAIContext(userId, userMessage, botId = 'default') {
    // 1. Initialize queue and flag if not exists
    if (!userQueues.has(userId)) userQueues.set(userId, []);
    if (!userProcessingFlags.has(userId)) userProcessingFlags.set(userId, false);

    // 2. Add message to user's queue
    userQueues.get(userId).push({ userMessage, botId });

    // 3. Start processing if not already running
    if (!userProcessingFlags.get(userId)) {
        await processUserQueue(userId);
    }
}

async function processUserQueue(userId) {
    userProcessingFlags.set(userId, true);
    const queue = userQueues.get(userId);

    while (queue.length > 0) {
        const { userMessage, botId } = queue.shift(); // Get oldest message
        try {
            await doProcessAIContext(userId, userMessage, botId);
        } catch (e) {
            console.error(`❌ Queue Error for ${userId}:`, e);
        }
    }

    userProcessingFlags.set(userId, false);
}

async function doProcessAIContext(userId, userMessage, botId) {
    try {
        console.log(`\n🧠 [${botId}] Processing Aggregated Context for ${userId}: "${userMessage.substring(0, 50)}..."`);

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
// --- LIVE LOGGING INTERCEPTOR ---
const recentLogs = [];
const originalLog = console.log;
const originalError = console.error;
function captureLog(type, args) {
    try {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        recentLogs.unshift(`[${type}] ${new Date().toISOString()} - ${msg}`);
        if (recentLogs.length > 200) recentLogs.pop();
    } catch (e) { }
}
console.log = function (...args) { captureLog('INFO', args); originalLog.apply(console, args); };
console.error = function (...args) { captureLog('ERROR', args); originalError.apply(console, args); };

process.on('uncaughtException', (err) => console.error('UNCAUGHT EXCEPTION:', err.message, err.stack));
process.on('unhandledRejection', (reason) => console.error('UNHANDLED REJECTION:', reason));

app.get('/debug-logs', (req, res) => res.type('text/plain').send(recentLogs.join('\n')));

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

    // 3. Deduplication ONLY for exact same Rapid Retries (ManyChat Bug)
    // We only ignore if the exact same message was sent multiple times in the SAME buffer window
    const isExactDuplicateChunk = messageBuffers[userId].messages.includes(incomingMsg);
    
    if (!isExactDuplicateChunk) {
        // Only push if it's new text (e.g. "Junior" then "Mexico")
        messageBuffers[userId].messages.push(incomingMsg);
        messageBuffers[userId].botId = bot_id; // Update bot_id to latest
    } else {
        console.log(`♻️ MINOR DEDUPLICATION: Ignoring exact duplicate chunk inside buffer window: "${incomingMsg}"`);
    }

    // 4. Reset Timer (Debounce - Wait for user to finish typing)
    if (messageBuffers[userId].timer) {
        clearTimeout(messageBuffers[userId].timer);
    }

    messageBuffers[userId].timer = setTimeout(() => {
        // TIMEOUT REACHED (User stopped typing for 7 seconds)
        // Extract data before deleting
        const finalContext = messageBuffers[userId].messages.join('\\n'); // Combine chunks with newlines
        const finalBotId = messageBuffers[userId].botId;

        // Clean up buffer BEFORE processing
        delete messageBuffers[userId];

        // Trigger AI Background Process ONCE with the full context
        if (finalContext.trim() !== "") {
            processAIContext(userId, finalContext, finalBotId);
        }
    }, 7000); // 7 Seconds Wait Time

    // 5. Respond Immediately to ManyChat (Avoid Timeout)
    res.status(200).json({ status: 'buffered', message: 'Message chunk received and buffering.' });
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
