const axios = require('axios');
require('dotenv').config();

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    console.log("Testing Key via REST API...");
    try {
        const res = await axios.get(url);
        console.log("Status:", res.status);
        console.log("Models found:", res.data.models ? res.data.models.length : 0);
        if (res.data.models) {
            res.data.models.forEach(m => console.log(" - " + m.name));
        }
    } catch (error) {
        console.error("Error listing models:", error.response ? error.response.data : error.message);
    }
}

test();
