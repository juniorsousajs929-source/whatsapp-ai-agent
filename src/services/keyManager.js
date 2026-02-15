require('dotenv').config();

// Load all keys from .env
function loadKeys() {
    let keys = [];

    // 1. Check comma-separated list
    if (process.env.GEMINI_KEYS) {
        const raw = process.env.GEMINI_KEYS.split(',');
        keys = raw.map(k => k.trim()).filter(k => k.length > 0);
    }

    // 2. Fallback: Check individual keys (legacy support)
    if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);

    let i = 1;
    while (process.env[`GEMINI_KEY_${i}`]) {
        keys.push(process.env[`GEMINI_KEY_${i}`]);
        i++;
    }

    // Remove duplicates
    keys = [...new Set(keys)];

    if (keys.length === 0) {
        console.error("CRITICAL: No GEMINI_API_KEY found in .env!");
    } else {
        console.log(`KeyManager loaded ${keys.length} API Keys from .env.`);
    }

    return keys;
}

const keys = loadKeys();
let currentIndex = 0;

module.exports = {
    // Round-Robin Strategy: Get next key in the list
    getNextKey: () => {
        if (keys.length === 0) return null;

        const key = keys[currentIndex];
        // Move index to next, loop back to 0 if at end
        currentIndex = (currentIndex + 1) % keys.length;
        return key;
    },

    // Get current pool size (for debugging)
    getPoolSize: () => keys.length
};
