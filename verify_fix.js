const fs = require('fs');
const path = require('path');

// VERIFICATION SCRIPT FOR PERSISTENCE FIX
// Simulates server restart by reloading the map from disk

const DATA_DIR = path.join(__dirname, 'data');
const LAST_RESPONSES_FILE = path.join(DATA_DIR, 'last_responses.json');

// MOCK SERVER STATE
let userLastResponse = new Map();

// MOCK FUNCTIONS from server.js
function loadUserLastResponse() {
    try {
        if (fs.existsSync(LAST_RESPONSES_FILE)) {
            const data = fs.readFileSync(LAST_RESPONSES_FILE, 'utf8');
            const json = JSON.parse(data);
            userLastResponse = new Map(Object.entries(json));
            console.log(`[PERSISTENCE] Loaded ${userLastResponse.size} entries.`);
        }
    } catch (error) {
        console.error("[PERSISTENCE] Error loading:", error);
    }
}

function saveUserLastResponse() {
    try {
        const obj = Object.fromEntries(userLastResponse);
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(LAST_RESPONSES_FILE, JSON.stringify(obj, null, 2));
        console.log(`[PERSISTENCE] Saved to disk.`);
    } catch (error) {
        console.error("[PERSISTENCE] Error saving:", error);
    }
}

// SIMULATION
async function runVerification() {
    const userId = "verify_user_999";
    const botMessage = "I am the bot message that must be remembered.";

    console.log("=== STEP 1: Bot generates response and saves it ===");
    userLastResponse.set(userId, botMessage);
    saveUserLastResponse();

    // Verify file exists
    if (fs.existsSync(LAST_RESPONSES_FILE)) {
        console.log("✅ File created successfully.");
    } else {
        console.error("❌ File NOT created.");
        return;
    }

    console.log("\n=== STEP 2: SIMULATE SERVER RESTART (Clear Memory) ===");
    userLastResponse = new Map(); // Wipe memory
    console.log(`Memory size after wipe: ${userLastResponse.size}`);

    console.log("\n=== STEP 3: Server Starts Up (Load from Disk) ===");
    loadUserLastResponse();

    console.log("\n=== STEP 4: Check if memory restored ===");
    const initialSize = userLastResponse.size;
    const restoredMsg = userLastResponse.get(userId);

    if (restoredMsg === botMessage) {
        console.log(`✅ SUCCESS: Restored message: "${restoredMsg}"`);
    } else {
        console.log(`❌ FAILED: Message not found or mismatch. Found: ${restoredMsg}`);
    }

    // Cleanup
    // fs.unlinkSync(LAST_RESPONSES_FILE);
}

runVerification();
