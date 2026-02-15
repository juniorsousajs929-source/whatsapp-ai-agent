const axios = require('axios');
const secrets = require('./src/config/secrets');

const MANYCHAT_API_BASE = 'https://api.manychat.com/fb';
const TOKEN = secrets.MANYCHAT_TOKEN_ZAP6;

async function debugZap6() {
    console.log("🕵️‍♀️ DEBUGGING ZAP 6 MANYCHAT ACCOUNT...");
    console.log("Token:", TOKEN.substring(0, 10) + "...");

    try {
        // 1. Get All Custom Fields
        console.log("\n1️⃣ Fetching Custom Fields...");
        const fieldsRes = await axios.get(`${MANYCHAT_API_BASE}/page/getCustomFields`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });

        const fields = fieldsRes.data.data;
        console.log(`✅ Found ${fields.length} custom fields.`);

        // 2. Search for 'teste_robo'
        const targetField = fields.find(f => f.name === 'teste_robo');

        if (targetField) {
            console.log("\n✅ FIELD FOUND!");
            console.log("Name:", targetField.name);
            console.log("ID:", targetField.id);
            console.log("Type:", targetField.type);
        } else {
            console.error("\n❌ FIELD 'teste_robo' NOT FOUND!");
            console.log("Here are the available fields:");
            fields.forEach(f => console.log(`- [${f.id}] ${f.name} (${f.type})`));
        }

    } catch (error) {
        console.error("\n❌ API ERROR:", error.response ? error.response.data : error.message);
    }
}

debugZap6();
