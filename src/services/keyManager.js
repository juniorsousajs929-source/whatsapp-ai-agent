require('dotenv').config();

// Load all keys from .env
function loadKeys() {
    let keys = [];

    // Support comma-separated list
    if (process.env.GEMINI_KEYS) {
        const splitKeys = process.env.GEMINI_KEYS.split(',').map(k => k.trim()).filter(k => k !== '');
        keys = keys.concat(splitKeys);
    }

    // Individual keys detection with common alternatives
    const possiblePrefixes = ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'API_KEY'];
    possiblePrefixes.forEach(name => {
        const val = process.env[name];
        if (val && typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed && !keys.includes(trimmed)) keys.push(trimmed);
        }
    });

    let i = 1;
    while (true) {
        const keyName = `GEMINI_KEY_${i}`;
        const altName = `GOOGLE_API_KEY_${i}`;
        const val = process.env[keyName] || process.env[altName];

        if (!val) break;

        if (typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed && !keys.includes(trimmed)) keys.push(trimmed);
        }
        i++;
    }

    // Sanitization: Filter empty or extra short strings, and clean up stray quotes
    keys = [...new Set(keys)].map(k => k.replace(/['"]+/g, '')).filter(k => k && k.length > 20);

    if (keys.length === 0) {
        console.error("❌ CRITICAL: No valid API keys found in Render environment! Your bot will NOT respond.");
    } else {
        // Safe Debugging: Show first 4 and last 4 of keys in logs
        console.log(`📡 KeyManager initialized with ${keys.length} rotating keys.`);
        keys.forEach((k, idx) => {
            console.log(`   [Key ${idx + 1}]: ${k.substring(0, 4)}...${k.slice(-4)}`);
        });
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
